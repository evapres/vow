import { buildInviteOgImageResponse } from "@/lib/invite/buildInviteOgImageResponse";
import { INVITE_LINK_PREVIEW_IMAGE_ALT } from "@/lib/share/inviteShareCopy";

export const runtime = "nodejs";
export const alt = INVITE_LINK_PREVIEW_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type ImageProps = {
  params: Promise<{ token: string }>;
};

/** Next.js wires this file into `og:image` for `/invite/[token]`. */
export default async function InviteOpenGraphImage({ params }: ImageProps) {
  const { token } = await params;
  const response = await buildInviteOgImageResponse(token);

  if (!response) {
    return new Response("Not found", { status: 404 });
  }

  return response;
}
