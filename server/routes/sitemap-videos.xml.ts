/**
 * Video Sitemap for Google Video Search Indexing
 * 
 * Based on Google Video Sitemap specification:
 * https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps
 * 
 * This generates a sitemap with <video:video> tags for all videos across:
 * - Treatment pages (blocks with video media)
 * - Location pages (blocks with video media)
 * - Blog articles (blocks with video media)
 * 
 * Each video entry includes:
 * - video:thumbnail_loc (poster/thumbnail URL)
 * - video:title (video title from block or fallback)
 * - video:description (video description from block or fallback)
 * - video:content_loc (direct video URL)
 * - video:player_loc (page URL where video is embedded)
 * - video:upload_date (ISO 8601 date)
 */

import qs from "qs";
import { buildVideoPosterUrl, getMediaZoneOrigin } from "~/utils/media";

type StrapiPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

type StrapiListResponse<T> = {
  data: T[];
  meta?: {
    pagination?: StrapiPagination;
  };
};

type VideoEntry = {
  pageUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  uploadDate: string;
};

const LOCALES = ["de", "en", "tr", "ar", "fr", "nl"] as const;
const DEFAULT_LOCALE = "de";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const strapiUrl = config.public.strapiUrl;
  
  if (!strapiUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "NUXT_PUBLIC_STRAPI_URL missing for video sitemap",
    });
  }

  const requestUrl = getRequestURL(event);
  const siteUrl = config.public.publicUrl || `${requestUrl.protocol}//${requestUrl.host}`;

  const videos: VideoEntry[] = [];

  /**
   * Helper: Fetch from Strapi with pagination
   */
  async function fetchCollection<T>(
    endpoint: string,
    query: Record<string, any>,
  ): Promise<T[]> {
    const result: T[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const params = qs.stringify({
        ...query,
        pagination: { page, pageSize: 100 },
      });

      const url = `${strapiUrl}/api/${endpoint}?${params}`;
      
      try {
        const response = await $fetch<StrapiListResponse<T>>(url);
        const items = response.data || [];
        result.push(...items);

        const pagination = response.meta?.pagination;
        hasMore = pagination ? page < pagination.pageCount : false;
        page++;
      } catch (err) {
        console.error(`[video-sitemap] Failed to fetch ${endpoint}:`, err);
        hasMore = false;
      }
    }

    return result;
  }

  /**
   * Helper: Extract videos from blocks
   */
  function extractVideosFromBlocks(
    blocks: any[] | undefined,
    pageUrl: string,
    pageName: string,
  ): VideoEntry[] {
    if (!blocks || !Array.isArray(blocks)) return [];

    const foundVideos: VideoEntry[] = [];

    for (const block of blocks) {
      // Check for media field (most common)
      const media = block.media;
      
      if (media && media.mime && media.mime.startsWith("video/")) {
        const videoUrl = media.url;
        if (!videoUrl) continue;

        const canUseTransformations = !!getMediaZoneOrigin(videoUrl);
        const thumbnailUrl = canUseTransformations
          ? buildVideoPosterUrl(videoUrl)
          : videoUrl; // Fallback to video URL

        const title = block.heading || block.title || block.headline || `${pageName} - Video`;
        const description = block.content?.map((c: any) => c.children?.map((ch: any) => ch.text).join(" ")).join(" ") 
          || block.text 
          || `Video from ${pageName}`;

        foundVideos.push({
          pageUrl,
          videoUrl,
          thumbnailUrl,
          title: title.substring(0, 100), // Max 100 chars for title
          description: description.substring(0, 2048), // Max 2048 chars for description
          uploadDate: media.createdAt || new Date().toISOString(),
        });
      }

      // Check for medias array (MediaBento, galleries, etc.)
      if (block.medias && Array.isArray(block.medias)) {
        for (const mediaItem of block.medias) {
          if (mediaItem.mime && mediaItem.mime.startsWith("video/")) {
            const videoUrl = mediaItem.url;
            if (!videoUrl) continue;

            const canUseTransformations = !!getMediaZoneOrigin(videoUrl);
            const thumbnailUrl = canUseTransformations
              ? buildVideoPosterUrl(videoUrl)
              : videoUrl;

            foundVideos.push({
              pageUrl,
              videoUrl,
              thumbnailUrl,
              title: `${pageName} - Video`.substring(0, 100),
              description: `Video from ${pageName}`.substring(0, 2048),
              uploadDate: mediaItem.createdAt || new Date().toISOString(),
            });
          }
        }
      }

      // Check for stories array (blocks.stories component)
      if (block.stories && Array.isArray(block.stories)) {
        for (const story of block.stories) {
          const video = story.video;
          if (video && video.mime && video.mime.startsWith("video/")) {
            const videoUrl = video.url;
            if (!videoUrl) continue;

            const canUseTransformations = !!getMediaZoneOrigin(videoUrl);
            const thumbnailUrl = canUseTransformations
              ? buildVideoPosterUrl(videoUrl)
              : videoUrl;

            const title = story.title || `${pageName} - Story`;
            const description = video.alternativeText || story.subtitle || `Story video from ${pageName}`;

            foundVideos.push({
              pageUrl,
              videoUrl,
              thumbnailUrl,
              title: title.substring(0, 100),
              description: description.substring(0, 2048),
              uploadDate: video.createdAt || new Date().toISOString(),
            });
          }
        }
      }
    }

    return foundVideos;
  }

  /**
   * 1. Homepage
   */
  try {
    const homepageUrl = `${strapiUrl}/api/homepage?locale=${DEFAULT_LOCALE}&populate=deep`;
    const homepageData = await $fetch<any>(homepageUrl);
    const homepage = homepageData.data;
    
    if (homepage && homepage.blocks) {
      const pageUrl = `${siteUrl}`;
      const pageName = "MY HEALTH & BEAUTY";
      const homeVideos = extractVideosFromBlocks(homepage.blocks, pageUrl, pageName);
      videos.push(...homeVideos);
    }
  } catch (err) {
    console.error("[video-sitemap] Failed to fetch homepage:", err);
  }

  /**
   * 2. Treatment Pages
   */
  const treatmentPages = await fetchCollection<any>("treatment-pages", {
    locale: [DEFAULT_LOCALE],
    populate: "deep",
  });

  for (const page of treatmentPages) {
    const slugPath = page.slug?.map((s: any) => s.value).join("/") || "";
    const pageUrl = `${siteUrl}/behandlungen/${slugPath}`;
    const pageName = page.name || "Treatment";

    const pageVideos = extractVideosFromBlocks(page.blocks, pageUrl, pageName);
    videos.push(...pageVideos);
  }

  /**
   * 3. Location Pages (locations collection)
   */
  const locations = await fetchCollection<any>("locations", {
    locale: [DEFAULT_LOCALE],
    populate: "deep",
  });

  for (const location of locations) {
    const citySlug = location.city?.slug?.value || "";
    const locationSlug = location.slug?.value || "";
    if (!citySlug || !locationSlug) continue;

    const pageUrl = `${siteUrl}/standorte/${citySlug}/${locationSlug}`;
    const pageName = location.name || "Location";

    const pageVideos = extractVideosFromBlocks(location.blocks, pageUrl, pageName);
    videos.push(...pageVideos);
  }

  /**
   * 4. Blog Articles
   */
  const blogArticles = await fetchCollection<any>("blog-articles", {
    locale: [DEFAULT_LOCALE],
    populate: "deep",
  });

  for (const article of blogArticles) {
    const slug = article.slug?.value || "";
    if (!slug) continue;

    const pageUrl = `${siteUrl}/blog/${slug}`;
    const pageName = article.title || "Blog Article";

    const pageVideos = extractVideosFromBlocks(article.blocks, pageUrl, pageName);
    videos.push(...pageVideos);
  }

  /**
   * Generate XML
   */
  const videoTags = videos
    .map((v) => {
      // Use video URL as fallback if no thumbnail
      const thumbnail = v.thumbnailUrl || v.videoUrl;
      
      return `  <url>
    <loc>${escapeXml(v.pageUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(thumbnail)}</video:thumbnail_loc>
      <video:title>${escapeXml(v.title)}</video:title>
      <video:description>${escapeXml(v.description)}</video:description>
      <video:content_loc>${escapeXml(v.videoUrl)}</video:content_loc>
      <video:player_loc>${escapeXml(v.pageUrl)}</video:player_loc>
      <video:upload_date>${v.uploadDate}</video:upload_date>
    </video:video>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${videoTags}
</urlset>`;

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setHeader(event, "Cache-Control", "public, max-age=3600, s-maxage=3600");

  return xml;
});

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
