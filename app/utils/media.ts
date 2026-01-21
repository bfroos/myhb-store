import type { ImageFormat } from "~/lib/strapi/dto/enums";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { ImageFormat as ImageFormatEnum } from "~/lib/strapi/dto/enums";

/**
 * Returns the URL for the requested image format, falling back to the next smaller format if not available.
 * If no format is available, returns the original media URL.
 *
 * @param media - The Strapi media object
 * @param format - The requested image format
 * @returns The URL of the best available format, or the original URL as fallback
 */
export function getMediaUrl(
  media: StrapiMedia,
  format: ImageFormat
): string | undefined {
  // If it's a video, return the URL directly (videos don't have formats)
  if (media?.mime?.startsWith("video/")) {
    return media.url;
  }

  if (!media?.formats) {
    return media?.url;
  }

  // Define format hierarchy from smallest to largest
  const formatHierarchy: ImageFormat[] = [
    ImageFormatEnum.THUMBNAIL,
    ImageFormatEnum.SMALL,
    ImageFormatEnum.MEDIUM,
    ImageFormatEnum.LARGE,
  ];

  // Find the index of the requested format
  const requestedIndex = formatHierarchy.indexOf(format);

  if (requestedIndex === -1) {
    // Unknown format, return original URL
    return media.url;
  }

  // Check if the requested format is available
  const requestedFormat = media.formats[format];
  if (requestedFormat?.url) {
    return requestedFormat.url;
  }

  // Fallback: find the next smaller format that is available
  for (let i = requestedIndex - 1; i >= 0; i--) {
    const fallbackFormat = formatHierarchy[i];
    if (!fallbackFormat) continue;
    const formatData = media.formats?.[fallbackFormat];
    if (formatData?.url) {
      return formatData.url;
    }
  }

  // If no format is available, return the original URL
  return media.url;
}

export function isMediaImage(media: StrapiMedia): boolean {
  return media?.mime?.startsWith("image/");
}

export function isMediaVideo(media: StrapiMedia): boolean {
  return media?.mime?.startsWith("video/");
}
