"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient as createAdminClient } from "@supabase/supabase-js";

import { invitationMusicUrlFromForm } from "@/lib/admin/invitationMusicFromForm";
import { combineWeddingDateAndTime } from "@/lib/invitationDisplay";
import { createClient } from "@/lib/supabase/server";
import { parseInvitationThemeId } from "@/lib/invitationThemes";
import { coupleInitialsForStorage } from "@/lib/coupleInitials";
import { coupleNamesFromFormData, validateCoupleNamesForm, parseCoupleNames } from "@/lib/coupleNamesForm";
import { validateInvitationStepForm } from "@/lib/weddingProgress";
import { isMissingInvitationThemeColumn } from "@/lib/supabaseMissingColumn";
import { isMissingCoupleInitialsColumns } from "@/lib/supabaseMissingColumn";
import { persistHeroImageFile } from "@/lib/heroImageUpload";
import { joinWeddingLocationStorage } from "@/lib/weddingLocation";

function getServiceRoleClientOrNull() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY ?? "";
  if (!url?.trim() || !serviceKey.trim()) return null;
  return createAdminClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function dbAfterAuth(supabase: Awaited<ReturnType<typeof createClient>>) {
  return getServiceRoleClientOrNull() ?? supabase;
}

function optionalDate(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

function optionalText(value: FormDataEntryValue | null): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

async function persistWeddingUpdate(
  supabase: Awaited<ReturnType<typeof createClient>>,
  weddingId: string,
  userId: string,
  patch: Record<string, unknown>,
) {
  const db = dbAfterAuth(supabase);
  let patchToApply = { ...patch };
  let { error } = await db.from("weddings").update(patchToApply).eq("id", weddingId).eq("user_id", userId);

  if (error && isMissingInvitationThemeColumn(error) && "invitation_theme" in patchToApply) {
    const { invitation_theme: _theme, ...withoutTheme } = patchToApply;
    patchToApply = withoutTheme;
    ({ error } = await db.from("weddings").update(patchToApply).eq("id", weddingId).eq("user_id", userId));
  }

  if (
    error &&
    isMissingCoupleInitialsColumns(error) &&
    ("couple_initial_left" in patchToApply || "couple_initial_right" in patchToApply)
  ) {
    const { couple_initial_left: _left, couple_initial_right: _right, ...withoutInitials } = patchToApply;
    patchToApply = withoutInitials;
    ({ error } = await db.from("weddings").update(patchToApply).eq("id", weddingId).eq("user_id", userId));
  }

  return error;
}

async function persistWeddingInsert(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: Record<string, unknown>,
) {
  const db = dbAfterAuth(supabase);
  let rowToInsert = { ...row };
  let result = await db.from("weddings").insert(rowToInsert).select("id").single();

  if (result.error && isMissingInvitationThemeColumn(result.error) && "invitation_theme" in rowToInsert) {
    const { invitation_theme: _theme, ...withoutTheme } = rowToInsert;
    rowToInsert = withoutTheme;
    result = await db.from("weddings").insert(rowToInsert).select("id").single();
  }

  if (
    result.error &&
    isMissingCoupleInitialsColumns(result.error) &&
    ("couple_initial_left" in rowToInsert || "couple_initial_right" in rowToInsert)
  ) {
    const { couple_initial_left: _left, couple_initial_right: _right, ...withoutInitials } = rowToInsert;
    rowToInsert = withoutInitials;
    result = await db.from("weddings").insert(rowToInsert).select("id").single();
  }

  return result;
}

export async function createWedding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(
      "/admin/new?error=" +
        encodeURIComponent(
          authError?.message ?? "You must be signed in to create a wedding.",
        ),
    );
  }

  const language = String(formData.get("language") ?? "en").trim() === "el" ? "el" : "en";
  const coupleNames = coupleNamesFromFormData(formData, language);
  const invitation_theme = parseInvitationThemeId(formData.get("invitation_theme"));
  const weddingDateOnly = optionalDate(formData.get("wedding_date"));
  const weddingTime = optionalText(formData.get("wedding_time")) ?? "20:00";
  const weddingDate = combineWeddingDateAndTime(weddingDateOnly, weddingTime);
  const venue_name = optionalText(formData.get("venue_name"));
  const church_name = optionalText(formData.get("church_name"));
  const street_address = optionalText(formData.get("street_address"));
  const rsvpDeadline = optionalDate(formData.get("rsvp_deadline"));

  const coupleNamesError = validateCoupleNamesForm(parseCoupleNames(coupleNames, language));
  if (coupleNamesError) {
    redirect("/admin/new?error=" + encodeURIComponent(coupleNamesError));
  }

  const stepError = validateInvitationStepForm({
    coupleNames,
    weddingDate: weddingDateOnly,
    venueName: venue_name,
    churchName: church_name,
    streetAddress: street_address,
    rsvpDeadline,
  });
  if (stepError) {
    redirect("/admin/new?error=" + encodeURIComponent(stepError));
  }

  const location = joinWeddingLocationStorage(
    venue_name ?? "",
    church_name ?? "",
    street_address ?? "",
  );
  const note = optionalText(formData.get("note"));
  const { couple_initial_left, couple_initial_right } = coupleInitialsForStorage(coupleNames);

  let heroFileToUpload: File | null = null;
  const heroFile = formData.get("hero_image");
  if (heroFile instanceof File && heroFile.size > 0) {
    heroFileToUpload = heroFile;
  }

  let invitation_music_url: string | null = null;
  try {
    const music = await invitationMusicUrlFromForm(formData);
    if (music !== undefined) invitation_music_url = music;
  } catch (e) {
    redirect(
      "/admin/new?error=" +
        encodeURIComponent(e instanceof Error ? e.message : "Invalid invitation music file."),
    );
  }

  const { data, error } = await persistWeddingInsert(supabase, {
    user_id: user.id,
    couple_names: coupleNames,
    language,
    invitation_theme,
    wedding_date: weddingDate,
    venue_name,
    church_name,
    street_address,
    location,
    hero_image_url: null,
    invitation_music_url,
    rsvp_deadline: rsvpDeadline,
    note,
    couple_initial_left,
    couple_initial_right,
  });

  if (error || !data) {
    redirect(
      "/admin/new?error=" +
        encodeURIComponent(error?.message ?? "Could not create wedding. Check Supabase permissions and try again."),
    );
  }

  if (heroFileToUpload) {
    try {
      const db = dbAfterAuth(supabase);
      const heroImageUrl = await persistHeroImageFile(db, data.id, heroFileToUpload);
      const heroError = await persistWeddingUpdate(supabase, data.id, user.id, {
        hero_image_url: heroImageUrl,
      });
      if (heroError) {
        redirect(
          "/admin/new?error=" +
            encodeURIComponent(heroError.message ?? "Invitation saved but couple image could not be stored."),
        );
      }
    } catch (e) {
      redirect(
        "/admin/new?error=" +
          encodeURIComponent(e instanceof Error ? e.message : "Invitation saved but couple image upload failed."),
      );
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/new");
  revalidatePath("/admin/invitations");
  redirect(`/admin/new?created=${data.id}`);
}

export async function updateWedding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const weddingId = String(formData.get("wedding_id") ?? "").trim();
  if (!weddingId) {
    redirect("/admin?error=" + encodeURIComponent("Missing wedding."));
  }

  const { data: owned, error: ownError } = await supabase
    .from("weddings")
    .select("id")
    .eq("id", weddingId)
    .eq("user_id", user.id)
    .single();

  if (ownError || !owned) {
    redirect("/admin?error=" + encodeURIComponent("You can only edit your own weddings."));
  }

  const language = String(formData.get("language") ?? "en").trim() === "el" ? "el" : "en";
  const coupleNames = coupleNamesFromFormData(formData, language);
  const invitation_theme = parseInvitationThemeId(formData.get("invitation_theme"));
  const weddingDateOnly = optionalDate(formData.get("wedding_date"));
  const weddingTime = optionalText(formData.get("wedding_time")) ?? "20:00";
  const weddingDate = combineWeddingDateAndTime(weddingDateOnly, weddingTime);
  const venue_name = optionalText(formData.get("venue_name"));
  const church_name = optionalText(formData.get("church_name"));
  const street_address = optionalText(formData.get("street_address"));
  const rsvpDeadline = optionalDate(formData.get("rsvp_deadline"));

  const coupleNamesError = validateCoupleNamesForm(parseCoupleNames(coupleNames, language));
  if (coupleNamesError) {
    redirect(`/admin/edit/${weddingId}?error=` + encodeURIComponent(coupleNamesError));
  }

  const stepError = validateInvitationStepForm({
    coupleNames,
    weddingDate: weddingDateOnly,
    venueName: venue_name,
    churchName: church_name,
    streetAddress: street_address,
    rsvpDeadline,
  });
  if (stepError) {
    redirect(`/admin/edit/${weddingId}?error=` + encodeURIComponent(stepError));
  }

  const location = joinWeddingLocationStorage(
    venue_name ?? "",
    church_name ?? "",
    street_address ?? "",
  );
  const note = optionalText(formData.get("note"));
  const { couple_initial_left, couple_initial_right } = coupleInitialsForStorage(coupleNames);
  const clearHero = formData.get("clear_hero") === "1";

  const patch: Record<string, unknown> = {
    couple_names: coupleNames,
    language,
    invitation_theme,
    wedding_date: weddingDate,
    venue_name,
    church_name,
    street_address,
    location,
    rsvp_deadline: rsvpDeadline,
    note,
    couple_initial_left,
    couple_initial_right,
  };

  const heroFile = formData.get("hero_image");
  if (heroFile instanceof File && heroFile.size > 0) {
    try {
      const db = dbAfterAuth(supabase);
      patch.hero_image_url = await persistHeroImageFile(db, weddingId, heroFile);
    } catch (e) {
      redirect(
        `/admin/edit/${weddingId}?error=` +
          encodeURIComponent(e instanceof Error ? e.message : "Couple image upload failed."),
      );
    }
  } else if (clearHero) {
    patch.hero_image_url = null;
  }

  try {
    const music = await invitationMusicUrlFromForm(formData);
    if (music !== undefined) patch.invitation_music_url = music;
  } catch (e) {
    redirect(
      `/admin/edit/${weddingId}?error=` +
        encodeURIComponent(e instanceof Error ? e.message : "Invalid invitation music file."),
    );
  }

  const error = await persistWeddingUpdate(supabase, weddingId, user.id, patch);

  if (error) {
    redirect(`/admin/edit/${weddingId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/admin/edit/${weddingId}`);
  revalidatePath(`/preview/${weddingId}`);
  revalidatePath(`/dashboard/${weddingId}`);
  redirect(`/admin/edit/${weddingId}?saved=1`);
}

/** Deletes a wedding owned by the current user, including households and RSVPs. */
export async function deleteWedding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const weddingId = String(formData.get("wedding_id") ?? "").trim();
  if (!weddingId) {
    redirect("/admin/invitations?error=" + encodeURIComponent("Missing invitation id."));
  }

  const { data: owned, error: ownError } = await supabase
    .from("weddings")
    .select("id")
    .eq("id", weddingId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (ownError || !owned) {
    redirect(
      "/admin/invitations?error=" + encodeURIComponent("Invitation not found or you do not have access."),
    );
  }

  const mutate = dbAfterAuth(supabase);

  const { error: rsvpError } = await mutate.from("rsvps").delete().eq("wedding_id", weddingId);
  if (rsvpError) {
    redirect("/admin/invitations?error=" + encodeURIComponent(rsvpError.message));
  }

  const { error: householdError } = await mutate.from("households").delete().eq("wedding_id", weddingId);
  if (householdError) {
    redirect("/admin/invitations?error=" + encodeURIComponent(householdError.message));
  }

  const { error: weddingError } = await mutate.from("weddings").delete().eq("id", weddingId).eq("user_id", user.id);
  if (weddingError) {
    redirect("/admin/invitations?error=" + encodeURIComponent(weddingError.message));
  }

  revalidatePath("/admin/invitations");
  revalidatePath("/admin");
  revalidatePath(`/admin/edit/${weddingId}`);
  revalidatePath(`/preview/${weddingId}`);
  revalidatePath(`/dashboard/${weddingId}`);
  redirect("/admin/invitations?deleted=1");
}
