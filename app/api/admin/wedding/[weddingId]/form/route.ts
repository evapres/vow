import { NextResponse } from "next/server";

import type { AdminWeddingFormInitial } from "@/app/admin/AdminNewWeddingForm";
import { adminMediaUrlForEdit } from "@/lib/adminWeddingMedia";
import { loadOwnedWeddingFormRow } from "@/lib/adminWeddingFormLoad";
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

  const { data: wedding, error } = await loadOwnedWeddingFormRow(supabase, id, user.id);

  if (error || !wedding) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { date, time } = splitWeddingDateTimeForForm(String(wedding.wedding_date ?? ""));
  const rsvp = wedding.rsvp_deadline ? String(wedding.rsvp_deadline).slice(0, 10) : "";
  const locFields = hydrateLocationFormFields(wedding);

  const initial: AdminWeddingFormInitial = {
    coupleNames: String(wedding.couple_names ?? ""),
    language: wedding.language === "el" ? "el" : "en",
    weddingDate: date,
    weddingTime: time,
    venueName: locFields.venueName,
    churchName: locFields.churchName,
    streetAddress: locFields.streetAddress,
    heroImageUrl: adminMediaUrlForEdit(id, wedding.hero_image_url as string | null, "hero"),
    rsvpDeadline: rsvp,
    note: String(wedding.note ?? ""),
    invitationMusicUrl: adminMediaUrlForEdit(id, wedding.invitation_music_url as string | null, "music"),
    invitationTheme: parseInvitationThemeId(wedding.invitation_theme as string | null | undefined),
    coupleInitialLeft: String(wedding.couple_initial_left ?? ""),
    coupleInitialRight: String(wedding.couple_initial_right ?? ""),
  };

  return NextResponse.json(initial);
}
