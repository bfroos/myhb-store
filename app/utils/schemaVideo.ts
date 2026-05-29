/**
 * VideoObject Schema for Google Video Indexing (SSR-safe)
 *
 * Based on Schema.org VideoObject specification:
 * https://schema.org/VideoObject
 * https://developers.google.com/search/docs/appearance/structured-data/video
 *
 * REQUIRED fields:
 * - name: Video title
 * - description: Video description
 * - thumbnailUrl: Poster/thumbnail image URL(s)
 * - uploadDate: ISO 8601 date when video was published
 *
 * RECOMMENDED fields:
 * - contentUrl: Direct .mp4 URL (for indexing)
 * - embedUrl: Player URL (if different from page URL)
 * - duration: ISO 8601 duration (e.g., "PT1M30S" for 1:30)
 */

import type { StrapiMedia } from "~/lib/strapi/dto/types";

export interface VideoObjectInput {
  media: StrapiMedia;
  name: string;
  description: string;
  uploadDate?: string;
  duration?: string; // ISO 8601 duration, e.g., "PT1M30S"
  embedUrl?: string;
}

export function buildVideoObjectSchema(input: VideoObjectInput) {
  const { media, name, description, uploadDate, duration, embedUrl } = input;

  if (!media?.url) {
    return null;
  }

  const videoUrl = media.url;

  // Use video URL as thumbnail fallback (Google will extract a frame)
  const thumbnailUrl = videoUrl;

  // Use createdAt as fallback for uploadDate
  const effectiveUploadDate =
    uploadDate || media.createdAt || new Date().toISOString();

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl,
    uploadDate: effectiveUploadDate,
    contentUrl: videoUrl,
  };

  // Optional fields
  if (embedUrl) {
    schema.embedUrl = embedUrl;
  }

  if (duration) {
    schema.duration = duration;
  }

  // Optional: Add video dimensions if available
  if (media.width && media.height) {
    schema.width = media.width;
    schema.height = media.height;
  }

  return schema;
}
