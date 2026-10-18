// E24 SEO-Pilot Lippen (shared/seoPilotLippen.ts): Bewertungen und
// Aerzt:innen eines Pilot-Standorts fuer www. Dieselben Daten wie die
// go.-Vorlage v2 (adsTemplateV2Extras), dort schon bereinigt: Arztnamen nur
// mit Vornamen, Autor:innen mit Initiale (#307), Test-Eintraege raus.
import { SEO_CITY_LIPPEN } from "#shared/seoPilotLippen";

export default defineEventHandler(async (event) => {
  const city = getRouterParam(event, "city") ?? "";
  const loc = getRouterParam(event, "loc") ?? "";
  if (!SEO_CITY_LIPPEN[`${city}/${loc}`]) {
    throw createError({ statusCode: 404, statusMessage: "Not found" });
  }
  const extras = await adsTemplateV2Extras(event, city, loc, "de");
  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300");
  return extras;
});
