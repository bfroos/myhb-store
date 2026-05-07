import type { StrapiMedia } from "~/lib/strapi/dto/types";

export type LegacyImage = {
  src?: string;
  alt?: string;
};

export function mediaToLegacyImage(
  media?: StrapiMedia | null,
): LegacyImage | undefined {
  if (!media?.url) return undefined;

  return {
    src: media.url,
    alt: media.alternativeText ?? media.caption ?? undefined,
  };
}

export function mediaUrl(media?: StrapiMedia | null): string | undefined {
  return media?.url || undefined;
}
