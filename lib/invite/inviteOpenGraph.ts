import type { Metadata } from "next";

import {
  INVITE_LINK_PREVIEW_IMAGE_ALT,
  INVITE_LINK_PREVIEW_MESSAGE,
} from "@/lib/share/inviteShareCopy";

import { publicHeroImageUrlForShare } from "./heroImageForShare";
import { getInviteByToken } from "./loadInviteByToken";
import { resolveInviteShareImageUrl } from "./resolveInviteShareImageUrl";
import { resolveInviteOgSiteOrigin } from "./resolveInviteOgSiteOrigin";

export function buildInviteOpenGraphMetadata(args: {
  siteOrigin: string;
  token: string;
  imageUrl: string;
  useHeroImage?: boolean;
}): Metadata {
  const { siteOrigin, token, imageUrl, useHeroImage } = args;
  const origin = siteOrigin.replace(/\/$/, "");
  const inviteUrl = `${origin}/invite/${token}`;
  const title = INVITE_LINK_PREVIEW_MESSAGE;
  const description = INVITE_LINK_PREVIEW_MESSAGE;

  const imageEntry = useHeroImage
    ? { url: imageUrl, alt: INVITE_LINK_PREVIEW_IMAGE_ALT }
    : {
        url: imageUrl,
        secureUrl: imageUrl,
        width: 1200,
        height: 630,
        type: "image/png" as const,
        alt: INVITE_LINK_PREVIEW_IMAGE_ALT,
      };

  return {
    title,
    description,
    metadataBase: new URL(`${origin}/`),
    alternates: { canonical: inviteUrl },
    openGraph: {
      type: "website",
      url: inviteUrl,
      title,
      description,
      siteName: "Vow",
      images: [imageEntry],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: imageUrl, alt: INVITE_LINK_PREVIEW_IMAGE_ALT }],
    },
    other: {
      "og:image": imageUrl,
      "og:image:secure_url": imageUrl,
      "og:image:alt": INVITE_LINK_PREVIEW_IMAGE_ALT,
      ...(useHeroImage
        ? {}
        : {
            "og:image:width": "1200",
            "og:image:height": "630",
            "og:image:type": "image/png",
          }),
    },
  };
}

export async function inviteMetadataForToken(token: string): Promise<Metadata> {
  const trimmed = token.trim();
  const loaded = await getInviteByToken(trimmed);
  if (!loaded) {
    return { title: "Invitation not found", robots: { index: false, follow: false } };
  }

  const siteOrigin = await resolveInviteOgSiteOrigin();
  const heroPublic = Boolean(publicHeroImageUrlForShare(loaded.wedding.hero_image_url));
  const imageUrl = await resolveInviteShareImageUrl({
    token: trimmed,
    heroImageUrl: loaded.wedding.hero_image_url,
  });

  return buildInviteOpenGraphMetadata({
    siteOrigin,
    token: trimmed,
    imageUrl,
    useHeroImage: heroPublic,
  });
}
