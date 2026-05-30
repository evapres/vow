import { NextResponse } from "next/server";

import { buildInviteOgImageResponse } from "@/lib/invite/buildInviteOgImageResponse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ token: string }> };

/** Share-preview image: couple image when set, else envelope composite PNG. */
export async function GET(_req: Request, context: RouteContext) {
  const { token } = await context.params;
  const response = await buildInviteOgImageResponse(token);

  if (!response) {
    return new NextResponse("Not found", { status: 404 });
  }

  return response;
}
