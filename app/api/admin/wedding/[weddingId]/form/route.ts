import { NextResponse } from "next/server";

import type { AdminWeddingFormInitial } from "@/app/admin/AdminNewWeddingForm";
import { adminMediaUrlForEdit } from "@/lib/adminWeddingMedia";
import { splitWeddingDateTimeForForm } from "@/lib/invitationDisplay";
import { parseInvitationThemeId } from "@/lib/invitationThemes";
import { createClient } from "@/lib/supabase/server";
import { hydrateLocationFormFields } from "@/lib/weddingLocation";

type RouteContext = { params: Promise<{ weddingId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { weddingId } = await context.params;
  const id = weddingId.trim();
  if (!id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: wedding, error } = await supabase
    .from("weddings")
    .select(
      "couple_names, language, wedding_date, rsvp_deadline, note, venue_name, church_name, street_address, invitation_theme, hero_image_url, invitation_music_url",
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !wedding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { date, time } = splitWeddingDateTimeForForm(wedding.wedding_date);
  const rsvp = wedding.rsvp_deadline ? String(wedding.rsvp_deadline).slice(0, 10) : "";
  const locFields = hydrateLocationFormFields(wedding);

  const initial: AdminWeddingFormInitial = {
    coupleNames: wedding.couple_names ?? "",
    language: wedding.language === "el" ? "el" : "en",
    weddingDate: date,
    weddingTime: time,
    venueName: locFields.venueName,
    churchName: locFields.churchName,
    streetAddress: locFields.streetAddress,
    heroImageUrl: adminMediaUrlForEdit(id, wedding.hero_image_url, "hero"),
    rsvpDeadline: rsvp,
    note: wedding.note ?? "",
    invitationMusicUrl: adminMediaUrlForEdit(id, wedding.invitation_music_url, "music"),
    invitationTheme: parseInvitationThemeId(wedding.invitation_theme),
  };

  return NextResponse.json(initial);
}
