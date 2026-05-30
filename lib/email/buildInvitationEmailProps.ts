import type { InvitationEmailProps } from "../../emails/InvitationEmail";
import {
  envelopeTemplateImageAbsoluteUrl,
  formatEnvelopeCardDate,
} from "./envelopeCardCopy";
import {
  formatDetailsDateTime,
  formatRsvpBeforeEmailLine,
  splitDetailsDateTimeLines,
} from "../invitationDisplay";
import { celebrateLocationLineFromParts, joinWeddingLocationStorage } from "../weddingLocation";
import { formatSavedCoupleMonogramDisplay } from "../coupleInitials";
import { locationLineForEmailInLatinScript } from "./locationLineForEmailEnglish";

export type WeddingLike = {
  couple_names: string | null;
  wedding_date: string | null;
  /** Invitation page language; email date/time is always English. */
  language?: string | null;
  location: string | null;
  venue_name?: string | null;
  church_name?: string | null;
  street_address?: string | null;
  rsvp_deadline: string | null;
  couple_initial_left?: string | null;
  couple_initial_right?: string | null;
};

type HouseholdLike = {
  household_name: string | null;
  invite_token: string | null;
};

/**
 * Maps saved wedding + household rows to {@link InvitationEmailProps}.
 * Date/time lines are always English; the public invite page can still use {@link WeddingLike.language}.
 */
export async function buildInvitationEmailProps(input: {
  wedding: WeddingLike;
  household: HouseholdLike | null;
  siteOrigin: string;
}): Promise<InvitationEmailProps> {
  const { wedding, household, siteOrigin } = input;
  const coupleNames = (wedding.couple_names ?? "").trim() || "Couple";

  const combined = wedding.wedding_date ? formatDetailsDateTime(wedding.wedding_date, "en") : "";
  const { dateLine, timeLine } = combined
    ? splitDetailsDateTimeLines(combined)
    : { dateLine: "Date to be announced", timeLine: "" };

  const loc = (wedding.location ?? "").trim();
  const venueExplicit = (wedding.venue_name ?? "").trim();
  const church = (wedding.church_name ?? "").trim();
  const street = (wedding.street_address ?? "").trim();
  const orderedCelebrate = celebrateLocationLineFromParts(church, venueExplicit, street);
  const locForEmail = loc || joinWeddingLocationStorage(venueExplicit, church, street) || "";
  /** Single line in the email (church, venue, street); Latin script when the source is Greek. */
  const locationDisplayLineRaw = (orderedCelebrate || loc).trim();
  const locationDisplayLine = locationDisplayLineRaw
    ? locationLineForEmailInLatinScript(locationDisplayLineRaw)
    : "";
  const locForEmailOut = (locForEmail || "").trim()
    ? locationLineForEmailInLatinScript((locForEmail || "").trim())
    : "";

  const token = household?.invite_token?.trim();
  const inviteUrl =
    siteOrigin && token ? `${siteOrigin}/invite/${token}` : siteOrigin ? `${siteOrigin}/` : "https://example.com/";

  const backgroundImageAbsoluteUrl = siteOrigin ? `${siteOrigin}/email-fabric-background.png` : undefined;
  const envelopeCardImageSrc = envelopeTemplateImageAbsoluteUrl(siteOrigin);
  const envelopeCardDateDisplay = formatEnvelopeCardDate(wedding.wedding_date) || undefined;
  const envelopeMonogramDisplay = formatSavedCoupleMonogramDisplay({
    coupleInitialLeft: wedding.couple_initial_left,
    coupleInitialRight: wedding.couple_initial_right,
  });

  return {
    householdName: household?.household_name?.trim() || undefined,
    coupleNames,
    backgroundImageAbsoluteUrl,
    envelopeCardImageSrc,
    envelopeCardDateDisplay,
    weddingDate: combined || "Saturday, June 14",
    weddingDateLine: dateLine,
    weddingTimeLine: timeLine || undefined,
    calendarUrl: "https://calendar.google.com/calendar",
    rsvpDeadlineText: formatRsvpBeforeEmailLine(wedding.rsvp_deadline),
    venueName: undefined,
    venueAddress: locationDisplayLine || undefined,
    location: locForEmailOut || undefined,
    inviteUrl,
    envelopeMonogramDisplay,
  };
}
