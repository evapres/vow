import { headers } from "next/headers";

import { resolveInviteOgSiteOrigin } from "./resolveInviteOgSiteOrigin";

/**
 * Origin for invite links shown/copied on the dashboard.
 * Uses the current request host on localhost so local testing opens `http://localhost:3000/invite/...`.
 */
export async function resolveInviteDashboardSiteOrigin(): Promise<string> {
  const hdrs = await headers();
  const rawHost = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "";
  const host = rawHost.split(",")[0]?.trim() ?? "";
  const rawProto = hdrs.get("x-forwarded-proto") ?? "";
  const proto = rawProto.split(",")[0]?.trim().toLowerCase() || "http";
  const safeProto = proto === "http" || proto === "https" ? proto : "http";
  if (host) return `${safeProto}://${host}`;

  return resolveInviteOgSiteOrigin();
}
