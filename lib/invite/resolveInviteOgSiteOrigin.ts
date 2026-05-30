import { headers } from "next/headers";

/**
 * Public origin for invite link + OG image URLs.
 * Always prefer `NEXT_PUBLIC_SITE_URL` so share previews work when the app is opened on localhost
 * but links must be fetched by Messenger/WhatsApp from production.
 */
export async function resolveInviteOgSiteOrigin(): Promise<string> {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const hdrs = await headers();
  const rawHost = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "";
  const host = rawHost.split(",")[0]?.trim() ?? "";
  const rawProto = hdrs.get("x-forwarded-proto") ?? "";
  const proto = rawProto.split(",")[0]?.trim().toLowerCase() || "https";
  const safeProto = proto === "http" || proto === "https" ? proto : "https";
  if (host) return `${safeProto}://${host}`;

  const vercel = (process.env.VERCEL_URL ?? "").trim().replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;

  return "https://thevow.vip";
}
