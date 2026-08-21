/**
 * Video Sitemap for Google Video Search Indexing
 * https://developers.google.com/search/docs/crawling-indexing/sitemaps/video-sitemaps
 *
 * Story clips are excluded on purpose: Google requires the video to be the
 * page's primary content, and they are tiles repeated across many pages.
 * Videos without a poster image are skipped rather than emitted invalid.
 */

import qs from "qs";

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

type StrapiMediaLike = {
  url?: string;
  mime?: string;
  createdAt?: string;
};

type AboutLike = {
  headline?: string;
  intro?: string;
  media?: StrapiMediaLike | null;
  poster?: StrapiMediaLike | null;
};

type VideoEntry = {
  pageUrl: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  description: string;
  uploadDate: string;
};

const DEFAULT_LOCALE = "de";

/**
 * `populate=deep` is Strapi 4 and 400s on Strapi 5. `*` is used rather than
 * naming `poster`, because naming a field that is not deployed yet also 400s —
 * so this query works both before and after the CMS schema ships.
 */
const ABOUT_ITEM_POPULATE = { populate: "*" };

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
  const siteUrl =
    config.public.publicUrl || `${requestUrl.protocol}//${requestUrl.host}`;

  const videos: VideoEntry[] = [];

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

      try {
        const response = await $fetch<StrapiListResponse<T>>(
          `${strapiUrl}/api/${endpoint}?${params}`,
        );
        result.push(...(response.data || []));

        const pagination = response.meta?.pagination;
        hasMore = pagination ? page < pagination.pageCount : false;
        page++;
      } catch (err) {
        console.error(`[video-sitemap] Failed to fetch ${endpoint}:`, err);
        return [];
      }
    }

    return result;
  }

  function toEntry(
    about: AboutLike | null | undefined,
    pageUrl: string,
    fallbackTitle: string,
  ): VideoEntry | null {
    const media = about?.media;
    if (!media?.url || !media.mime?.startsWith("video/")) return null;

    const poster = about?.poster;
    if (!poster?.url) return null;
    if (poster.mime && !poster.mime.startsWith("image/")) return null;

    const uploadDate = media.createdAt;
    if (!uploadDate) return null;

    const title = stripPlaceholders(about?.headline || fallbackTitle || "");
    const description = stripPlaceholders(about?.intro || about?.headline || "");
    if (!title || !description) return null;

    return {
      pageUrl,
      videoUrl: media.url,
      thumbnailUrl: poster.url,
      title: title.substring(0, 100),
      description: description.substring(0, 2048),
      uploadDate,
    };
  }

  const treatmentPages = await fetchCollection<any>("treatment-pages", {
    locale: DEFAULT_LOCALE,
    fields: ["name", "pathKey"],
    populate: { about: ABOUT_ITEM_POPULATE },
  });

  for (const page of treatmentPages) {
    if (!page.pathKey) continue;
    const entry = toEntry(
      page.about,
      `${siteUrl}/behandlungen/${page.pathKey}`,
      page.name,
    );
    if (entry) videos.push(entry);
  }

  const locations = await fetchCollection<any>("locations", {
    locale: DEFAULT_LOCALE,
    fields: ["name", "slug"],
    populate: {
      city: { fields: ["slug"] },
      about: {
        populate: {
          open: ABOUT_ITEM_POPULATE,
          openSoon: ABOUT_ITEM_POPULATE,
          comingSoon: ABOUT_ITEM_POPULATE,
        },
      },
    },
  });

  for (const location of locations) {
    const citySlug = location.city?.slug;
    const locationSlug = location.slug;
    if (!citySlug || !locationSlug) continue;

    const pageUrl = `${siteUrl}/standorte/${citySlug}/${locationSlug}`;
    const about = location.about;
    const entry =
      toEntry(about?.open, pageUrl, location.name) ??
      toEntry(about?.openSoon, pageUrl, location.name) ??
      toEntry(about?.comingSoon, pageUrl, location.name);
    if (entry) videos.push(entry);
  }

  const videoTags = videos
    .map(
      (v) => `  <url>
    <loc>${escapeXml(v.pageUrl)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(v.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(v.title)}</video:title>
      <video:description>${escapeXml(v.description)}</video:description>
      <video:content_loc>${escapeXml(v.videoUrl)}</video:content_loc>
      <video:player_loc>${escapeXml(v.pageUrl)}</video:player_loc>
      <video:upload_date>${escapeXml(v.uploadDate)}</video:upload_date>
    </video:video>
  </url>`,
    )
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

function stripPlaceholders(text: string): string {
  return text
    .replace(/\{\{[^}]*\}\}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
