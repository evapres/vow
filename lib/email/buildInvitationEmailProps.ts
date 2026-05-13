import type { InvitationEmailProps } from "../../emails/InvitationEmail";
import {
  envelopeTemplateImageAbsoluteUrl,
  formatEnvelopeCardDate,
} from "./envelopeCardCopy";
import { formatDetailsDateTime, splitDetailsDateTimeLines } from "../invitationDisplay";
import { celebrateLocationLineFromParts, joinWeddingLocationStorage } from "../weddingLocation";
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
  hero_image_url: string | null;
};

type HouseholdLike = {
  household_name: string | null;
  invite_token: string | null;
};

function formatRsvpBeforeLine(iso: string | null | undefined): string {
  if (!iso?.trim()) return "Please RSVP using the link in this email.";
  const d = new Date(`${iso.trim().slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "Please RSVP using the link in this email.";
  const formatted = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
  return `Please RSVP before ${formatted}`;
}

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

  const hero = wedding.hero_image_url?.trim();
  const heroImageAbsoluteUrl =
    hero && (hero.startsWith("http://") || hero.startsWith("https://") || hero.startsWith("data:"))
      ? hero
      : undefined;

  const backgroundImageAbsoluteUrl = siteOrigin ? `${siteOrigin}/email-fabric-background.png` : undefined;
  const envelopeCardImageSrc = envelopeTemplateImageAbsoluteUrl(siteOrigin);
  const envelopeCardDateDisplay = formatEnvelopeCardDate(wedding.wedding_date) || undefined;

  return {
    householdName: household?.household_name?.trim() || undefined,
    coupleNames,
    backgroundImageAbsoluteUrl,
    envelopeCardImageSrc,
    envelopeCardDateDisplay,
    heroImageAbsoluteUrl,
    weddingDate: combined || "Saturday, June 14",
    weddingDateLine: dateLine,
    weddingTimeLine: timeLine || undefined,
    calendarUrl: "https://calendar.google.com/calendar",
    rsvpDeadlineText: formatRsvpBeforeLine(wedding.rsvp_deadline),
    venueName: undefined,
    venueAddress: locationDisplayLine || undefined,
    location: locForEmailOut || undefined,
    inviteUrl,
  };
}
