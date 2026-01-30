import type { ImageFormat } from "~/lib/strapi/dto/enums";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { ImageFormat as ImageFormatEnum } from "~/lib/strapi/dto/enums";

/** Predefined size presets for Cloudflare on-the-fly transformation (limited variants). */
export const IMAGE_SIZE_PRESETS: Record<
  ImageFormat,
  {
    width: number;
    format?: "webp" | "avif" | "auto";
    quality?: number;
    fit?: "scale-down" | "contain" | "cover";
  }
> = {
  [ImageFormatEnum.THUMBNAIL]: {
    width: 150,
    format: "webp",
    quality: 80,
    fit: "scale-down",
  },
  [ImageFormatEnum.SMALL]: {
    width: 420,
    format: "webp",
    quality: 85,
    fit: "scale-down",
  },
  [ImageFormatEnum.MEDIUM]: {
    width: 768,
    format: "webp",
    quality: 85,
    fit: "scale-down",
  },
  [ImageFormatEnum.LARGE]: {
    width: 1920,
    format: "webp",
    quality: 85,
    fit: "scale-down",
  },
};

type CloudflareImageOptions = (typeof IMAGE_SIZE_PRESETS)[ImageFormat];

/**
 * Builds a Cloudflare Image-Transform-URL (cdn-cgi/image) for on-the-fly resize/format.
 * Expects an absolute media URL (e.g. https://media.myhb.app/…) or a relative path.
 * Uses runtimeConfig.public.mediaUrl as the base for relative URLs.
 */
export function buildCloudflareImageUrl(
  mediaUrl: string,
  options: CloudflareImageOptions,
): string {
  const config = useRuntimeConfig();
  const mediaBaseUrl = config.public.mediaUrl ?? "";
  if (!mediaBaseUrl) return mediaUrl;

  const parts: string[] = [];
  if (options.width) parts.push(`width=${options.width}`);
  if (options.format) parts.push(`format=${options.format}`);
  if (options.quality != null) parts.push(`quality=${options.quality}`);
  if (options.fit) parts.push(`fit=${options.fit}`);
  const opts = parts.join(",");
  if (!opts) return mediaUrl;

  const isAbsolute = /^https?:\/\//i.test(mediaUrl);
  const origin = isAbsolute ? new URL(mediaUrl).origin : mediaBaseUrl;
  const path = isAbsolute
    ? new URL(mediaUrl).pathname
    : mediaUrl.startsWith("/")
    ? mediaUrl
    : `/${mediaUrl}`;

  return `${origin}/cdn-cgi/image/${opts}${path}`;
}

/**
 * Returns the URL for the requested image format (preset) via Cloudflare on-the-fly transformation.
 * Videos are delivered unchanged via media.url.
 *
 * @param media - Media object (url must point to the media CDN, e.g. R2/media.myhb.app)
 * @param format - Desired preset (thumbnail/small/medium/large)
 */
export function getMediaUrl(
  media: StrapiMedia,
  format: ImageFormat,
): string | undefined {
  if (!media?.url) return undefined;

  if (media?.mime?.startsWith("video/")) {
    return media.url;
  }

  const preset = IMAGE_SIZE_PRESETS[format as ImageFormat];
  if (!preset) return media.url;

  return buildCloudflareImageUrl(media.url, preset);
}

export function isMediaImage(media: StrapiMedia): boolean {
  return media?.mime?.startsWith("image/");
}

export function isMediaVideo(media: StrapiMedia): boolean {
  return media?.mime?.startsWith("video/");
}
