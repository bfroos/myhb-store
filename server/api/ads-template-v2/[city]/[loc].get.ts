// go.* (Ads-Modus), Seitenvorlage v2 (nur Vorschau /vorschau-v2/...):
// Bewertungen und Aerzt:innen des Standorts. Eigener Endpunkt, damit die
// Strapi-Antwort der echten Anzeigenseiten unveraendert bleibt.
import { sanitizeAdsContent } from "#shared/adsTerms";
import { isAdsTemplateV2Location } from "#shared/adsTemplateV2";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const siteMode = config.siteMode || config.public.siteMode;
  const city = getRouterParam(event, "city") ?? "";
  const loc = getRouterParam(event, "loc") ?? "";
  if (siteMode !== "ads" || !isAdsTemplateV2Location(city, loc)) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }
  const extras = await adsTemplateV2Extras(event, city, loc, "de");
  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300");
  return sanitizeAdsContent(extras, "de");
});
