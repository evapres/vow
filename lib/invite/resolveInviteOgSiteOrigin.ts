import { headers } from "next/headers";

import {
  DEFAULT_PUBLIC_SITE_ORIGIN,
  firstPublicSiteOrigin,
  normalizeSiteOrigin,
} from "@/lib/share/publicSiteOrigin";

/**
 * Public origin for invite link + OG image URLs.
 * Always prefer a public HTTPS origin so share previews work when the dashboard runs on localhost.
 */
export async function resolveInviteOgSiteOrigin(): Promise<string> {
  const fromEnv = normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? "");

  const hdrs = await headers();
  const rawHost = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "";
  const host = rawHost.split(",")[0]?.trim() ?? "";
  const rawProto = hdrs.get("x-forwarded-proto") ?? "";
  const proto = rawProto.split(",")[0]?.trim().toLowerCase() || "https";
  const safeProto = proto === "http" || proto === "https" ? proto : "https";
  const fromRequest = host ? `${safeProto}://${host}` : "";

  const vercel = normalizeSiteOrigin(process.env.VERCEL_URL ?? "");
  const fromVercel = vercel ? `https://${vercel.replace(/^https?:\/\//, "")}` : "";

  return firstPublicSiteOrigin(fromEnv, fromRequest, fromVercel, DEFAULT_PUBLIC_SITE_ORIGIN);
}
