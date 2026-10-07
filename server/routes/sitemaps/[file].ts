/**
 * /sitemaps/<segment>.xml: eine Teil-Sitemap je Seitentyp (TSEO-05).
 *
 * Scheitert der Aufbau (Strapi nicht erreichbar, leeres Ergebnis), antwortet
 * nur diese Teil-Sitemap mit 503 und Retry-After. Google versucht es spaeter
 * erneut, und das Vercel-CDN liefert bis dahin den letzten guten Stand
 * (stale-while-revalidate). Der Fehler steht als [sitemap] in den Logs.
 */
import {
  buildSegmentSitemap,
  isSitemapSegment,
  resolveSiteUrl,
} from "../../utils/sitemap";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  if (config.public.siteMode === "ads") {
    throw createError({
      statusCode: 404,
      statusMessage: "Sitemap is disabled in ads mode",
    });
  }

  const file = getRouterParam(event, "file") || "";
  const segment = file.replace(/\.xml$/, "");
  if (!file.endsWith(".xml") || !isSitemapSegment(segment)) {
    throw createError({ statusCode: 404, statusMessage: "Unknown sitemap" });
  }

  const strapiUrl = config.public.strapiUrl;
  if (!strapiUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: "NUXT_PUBLIC_STRAPI_URL fehlt fuer die Sitemap",
    });
  }

  try {
    const { xml, count, droppedRedirects } = await buildSegmentSitemap(
      segment,
      strapiUrl,
      resolveSiteUrl(event),
    );
    console.log(
      `[sitemap] ${segment}: ${count} URLs, ${droppedRedirects} Weiterleitungen entfernt`,
    );
    setHeader(event, "Content-Type", "application/xml; charset=utf-8");
    setHeader(
      event,
      "Vercel-CDN-Cache-Control",
      "s-maxage=3600, stale-while-revalidate=86400",
    );
    return xml;
  } catch (error) {
    console.error(`[sitemap] ${segment} fehlgeschlagen:`, error);
    setHeader(event, "Retry-After", "3600");
    setHeader(event, "Cache-Control", "no-store");
    setHeader(event, "Vercel-CDN-Cache-Control", "no-store");
    throw createError({
      statusCode: 503,
      statusMessage: `Sitemap ${segment} voruebergehend nicht verfuegbar`,
    });
  }
});
