import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { cleanStrapiUrl } from "~/utils/media";

export type LegacyImage = {
  src?: string;
  alt?: string;
};

export function mediaToLegacyImage(
  media?: StrapiMedia | null,
): LegacyImage | undefined {
  const src = cleanStrapiUrl(media?.url);
  if (!src) return undefined;

  return {
    src,
    alt: media.alternativeText ?? media.caption ?? undefined,
  };
}

export function mediaUrl(media?: StrapiMedia | null): string | undefined {
  return cleanStrapiUrl(media?.url);
}
