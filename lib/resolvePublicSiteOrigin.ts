import { headers } from "next/headers";

/**
 * Public origin for absolute URLs in outbound emails (invites, admin notifications).
 * Prefer `NEXT_PUBLIC_SITE_URL`, then this request's host headers, then `VERCEL_URL`.
 */
export async function resolvePublicSiteOrigin(): Promise<string> {
  const fromEnv = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const hdrs = await headers();
  const rawHost = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "";
  const host = rawHost.split(",")[0]?.trim() ?? "";
  const rawProto = hdrs.get("x-forwarded-proto") ?? "";
  const proto = rawProto.split(",")[0]?.trim().toLowerCase() || "";
  const safeProto = proto === "http" || proto === "https" ? proto : "https";
  if (host) {
    return `${safeProto}://${host}`;
  }

  const vercel = (process.env.VERCEL_URL ?? "").trim().replace(/\/$/, "");
  if (vercel) {
    if (/^https?:\/\//i.test(vercel)) return vercel;
    return `https://${vercel}`;
  }

  return "";
}
