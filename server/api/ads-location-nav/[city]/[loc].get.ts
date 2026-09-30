// go.* (Ads-Modus): pathKeys, die ein Standort im Ads-Baum hat - fuer das
// Behandlungsmenue in Kopf- und Fusszeile (useAdsNav). Klein und eigens, damit
// das Menue beim Server-Rendern nicht auf die Seitendaten warten muss.
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);
  const siteMode = config.siteMode || config.public.siteMode;
  if (siteMode !== "ads") {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }
  const city = getRouterParam(event, "city") ?? "";
  const loc = getRouterParam(event, "loc") ?? "";
  const keys = await locationPathKeys(event, city, loc);
  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300");
  return { pathKeys: keys ?? [] };
});
