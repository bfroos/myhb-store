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
    format: "auto", // Cloudflare serves AVIF if supported, else WebP
    quality: 80,
    fit: "scale-down",
  },
  [ImageFormatEnum.SMALL]: {
    width: 460,
    format: "auto",
    quality: 85,
    fit: "scale-down",
  },
  [ImageFormatEnum.MEDIUM]: {
    width: 760,
    format: "auto",
    quality: 85,
    fit: "scale-down",
  },
  [ImageFormatEnum.LARGE]: {
    width: 1100,
    format: "auto",
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

// ============================================================================
// Cloudflare Media Transformations (für Video-Poster & Video-Delivery)
// ============================================================================

/**
 * SSR-safe helper to determine the zone origin for Cloudflare media transformations.
 * Prefers the origin of the media URL itself, then falls back to request/window origin.
 */
export function getMediaZoneOrigin(sourceUrl?: string): string | null {
  if (sourceUrl) {
    try {
      const mediaUrl = new URL(sourceUrl);
      if (mediaUrl.origin) return mediaUrl.origin;
    } catch {
      // Falls URL nicht absolut/valide ist, Fallback zu Request-Origin
    }
  }

  // SSR: useRequestURL nutzen
  try {
    const url = useRequestURL();
    if (url?.origin) return url.origin;
  } catch {
    // useRequestURL ist in manchen Edge Cases nicht verfügbar
  }

  // Client-side Fallback
  if (
    import.meta.client &&
    typeof window !== "undefined" &&
    window.location?.origin
  ) {
    return window.location.origin;
  }

  return null;
}

/**
 * Encodes a source URL for Cloudflare Media Transformations.
 * Query params and hash are encoded so they don't interfere with the transformation URL.
 */
export function encodeSourceForMediaTransform(sourceUrl: string): string {
  try {
    const u = new URL(sourceUrl);
    let out = `${u.origin}${u.pathname}`;
    if (u.search) out += `%3F${u.search.slice(1)}`;
    if (u.hash) out += `%23${u.hash.slice(1)}`;
    return out;
  } catch {
    return sourceUrl;
  }
}

export interface VideoPosterOptions {
  time?: string;
  format?: "jpg" | "png" | "webp";
  width?: number;
  fit?: "scale-down" | "contain" | "cover";
}

const DEFAULT_POSTER_OPTIONS: Required<VideoPosterOptions> = {
  time: "0s",
  format: "jpg",
  width: 600,
  fit: "scale-down",
};

/**
 * Builds a Cloudflare Media Transformation URL for a video poster frame.
 *
 * NOTE: Disabled until Cloudflare Media Transformations are activated.
 */
export function buildVideoPosterUrl(
  _sourceUrl: string,
  _options: VideoPosterOptions = {},
): string {
  // Media Transformations not activated — no poster available.
  return "";
}

export interface TransformedVideoOptions {
  audio?: boolean;
  width?: number;
  height?: number;
  fit?: "scale-down" | "contain" | "cover";
}

const DEFAULT_VIDEO_OPTIONS: Required<
  Pick<TransformedVideoOptions, "audio" | "width" | "fit">
> = {
  audio: true,
  width: 1024,
  fit: "scale-down",
};

/**
 * Builds a Cloudflare Media Transformation URL for video delivery.
 *
 * NOTE: Cloudflare Media Transformations (/cdn-cgi/media/) require explicit
 * activation in the Cloudflare dashboard (Stream or Media Transformations add-on).
 * Until activated, we return the original URL directly to avoid broken video playback.
 */
export function buildTransformedVideoUrl(
  sourceUrl: string,
  _options: TransformedVideoOptions = {},
): string {
  // Media Transformations not activated — serve original URL directly.
  return sourceUrl || "";
}
