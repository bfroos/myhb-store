/**
 * GEO / AI-readiness: /llms.txt
 *
 * E24 #318: aus Strapi erzeugt (shared/llmsText.ts) statt festem Text:
 * alle eroeffneten Standorte mit Adresse, Telefon, Oeffnungszeiten und
 * Online-Termin, Behandlungen mit Preis, Kostenseiten. 6 h im Cache; bei
 * einem Strapi-Fehler der letzte gute Stand (stale). Auf go. aus wie die
 * Sitemap.
 */
import qs from "qs";
import { buildLlmsText } from "#shared/llmsText";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    if (config.public.siteMode === "ads") {
      throw createError({ statusCode: 404, statusMessage: "Not found" });
    }
    const requestUrl = getRequestURL(event);
    const siteUrl = (
      (config.public.publicUrl as string) ||
      `${requestUrl.protocol}//${requestUrl.host}`
    ).replace(/\/+$/, "");
    const base = String(config.public.strapiUrl || "").replace(/\/+$/, "");

    const locQuery = qs.stringify(
      {
        locale: "de",
        pagination: { pageSize: 100 },
        fields: ["name", "slug", "type", "newOpeningDate", "appBookingUrl"],
        populate: {
          city: { fields: ["name", "slug"] },
          address: true,
          contact: true,
          openingHours: { populate: { week: { populate: ["intervals"] } } },
        },
      },
      { encodeValuesOnly: true },
    );
    const [locs, prices] = await Promise.all([
      $fetch<{ data: any[] }>(`${base}/api/locations?${locQuery}`),
      $fetch<{ data: { productCategories?: any[] } }>(`${base}/api/prices-page/with-product-categories?locale=de`),
    ]);
    const body = buildLlmsText(siteUrl, locs?.data ?? [], prices?.data?.productCategories ?? []);
    setHeader(event, "Content-Type", "text/plain; charset=utf-8");
    return body;
  },
  {
    name: "llms.txt",
    maxAge: 60 * 60 * 6,
    staleMaxAge: 60 * 60 * 24,
  },
);
