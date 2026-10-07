/**
 * /sitemap.xml: Sitemap-Index (TSEO-05).
 *
 * Zeigt auf eine Teil-Sitemap je Seitentyp unter /sitemaps/<segment>.xml.
 * Der Index fragt Strapi nicht ab und kann deshalb nicht an einer Collection
 * scheitern. Aufbau, Filter und Fehlerverhalten: server/utils/sitemap.ts.
 */
import { buildSitemapIndex, resolveSiteUrl } from "../utils/sitemap";

export default defineEventHandler((event) => {
  if (useRuntimeConfig().public.siteMode === "ads") {
    throw createError({
      statusCode: 404,
      statusMessage: "Sitemap is disabled in ads mode",
    });
  }

  setHeader(event, "Content-Type", "application/xml; charset=utf-8");
  setHeader(
    event,
    "Vercel-CDN-Cache-Control",
    "s-maxage=3600, stale-while-revalidate=86400",
  );
  return buildSitemapIndex(resolveSiteUrl(event));
});
