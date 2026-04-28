"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { combineWeddingDateAndTime } from "@/lib/invitationDisplay";
import { createClient } from "@/lib/supabase/server";
import { joinWeddingLocationStorage } from "@/lib/weddingLocation";

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

export async function createWedding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(
      "/admin?error=" +
        encodeURIComponent(
          authError?.message ?? "You must be signed in to create a wedding.",
        ),
    );
  }

  const coupleNames = String(formData.get("couple_names") ?? "").trim();
  const language = String(formData.get("language") ?? "en").trim() === "el" ? "el" : "en";

  if (!coupleNames) {
    redirect("/admin?error=" + encodeURIComponent("Couple names are required."));
  }

  const weddingDateOnly = optionalDate(formData.get("wedding_date"));
  const weddingTime = optionalText(formData.get("wedding_time")) ?? "20:00";
  const weddingDate = combineWeddingDateAndTime(weddingDateOnly, weddingTime);
  const venue_name = optionalText(formData.get("venue_name"));
  const church_name = optionalText(formData.get("church_name"));
  const street_address = optionalText(formData.get("street_address"));
  const location = joinWeddingLocationStorage(
    venue_name ?? "",
    church_name ?? "",
    street_address ?? "",
  );
  const rsvpDeadline = optionalDate(formData.get("rsvp_deadline"));
  const note = optionalText(formData.get("note"));

  let heroImageUrl: string | null = null;
  const heroFile = formData.get("hero_image");
  if (heroFile instanceof File && heroFile.size > 0) {
    const maxBytes = 4 * 1024 * 1024;
    if (heroFile.size > maxBytes) {
      redirect("/admin?error=" + encodeURIComponent("Hero image is too large (max 4MB)."));
    }
    if (!heroFile.type.startsWith("image/")) {
      redirect("/admin?error=" + encodeURIComponent("Hero image must be an image file."));
    }
    const buf = Buffer.from(await heroFile.arrayBuffer());
    heroImageUrl = `data:${heroFile.type};base64,${buf.toString("base64")}`;
  }

  const { data, error } = await supabase
    .from("weddings")
    .insert({
      user_id: user.id,
      couple_names: coupleNames,
      language,
      wedding_date: weddingDate,
      venue_name,
      church_name,
      street_address,
      location,
      hero_image_url: heroImageUrl,
      rsvp_deadline: rsvpDeadline,
      note,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(
      "/admin?error=" +
        encodeURIComponent(error?.message ?? "Could not create wedding. Check Supabase permissions and try again."),
    );
  }

  redirect(`/admin?created=${data.id}`);
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

  const coupleNames = String(formData.get("couple_names") ?? "").trim();
  const language = String(formData.get("language") ?? "en").trim() === "el" ? "el" : "en";
  if (!coupleNames) {
    redirect(`/admin/edit/${weddingId}?error=` + encodeURIComponent("Couple names are required."));
  }

  const weddingDateOnly = optionalDate(formData.get("wedding_date"));
  const weddingTime = optionalText(formData.get("wedding_time")) ?? "20:00";
  const weddingDate = combineWeddingDateAndTime(weddingDateOnly, weddingTime);
  const venue_name = optionalText(formData.get("venue_name"));
  const church_name = optionalText(formData.get("church_name"));
  const street_address = optionalText(formData.get("street_address"));
  const location = joinWeddingLocationStorage(
    venue_name ?? "",
    church_name ?? "",
    street_address ?? "",
  );
  const rsvpDeadline = optionalDate(formData.get("rsvp_deadline"));
  const note = optionalText(formData.get("note"));
  const clearHero = formData.get("clear_hero") === "1";

  const patch: Record<string, unknown> = {
    couple_names: coupleNames,
    language,
    wedding_date: weddingDate,
    venue_name,
    church_name,
    street_address,
    location,
    rsvp_deadline: rsvpDeadline,
    note,
  };

  const heroFile = formData.get("hero_image");
  if (heroFile instanceof File && heroFile.size > 0) {
    const maxBytes = 4 * 1024 * 1024;
    if (heroFile.size > maxBytes) {
      redirect(`/admin/edit/${weddingId}?error=` + encodeURIComponent("Hero image is too large (max 4MB)."));
    }
    if (!heroFile.type.startsWith("image/")) {
      redirect(`/admin/edit/${weddingId}?error=` + encodeURIComponent("Hero image must be an image file."));
    }
    const buf = Buffer.from(await heroFile.arrayBuffer());
    patch.hero_image_url = `data:${heroFile.type};base64,${buf.toString("base64")}`;
  } else if (clearHero) {
    patch.hero_image_url = null;
  }

  const { error } = await supabase.from("weddings").update(patch).eq("id", weddingId).eq("user_id", user.id);

  if (error) {
    redirect(`/admin/edit/${weddingId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/admin/edit/${weddingId}`);
  revalidatePath(`/preview/${weddingId}`);
  revalidatePath(`/dashboard/${weddingId}`);
  redirect(`/admin/edit/${weddingId}?saved=1`);
}
