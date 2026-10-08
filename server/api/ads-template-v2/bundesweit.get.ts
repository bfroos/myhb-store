// Bundesweite Fassung der Seitenvorlage v2 (Meta-Seiten auf www,
// app/pages/aktion/[slug].vue, Benjamin 04.10.2026): Kundenbewertungen aller
// v2-Standorte, ohne Aerzt:innen (die Seite zeigt das Teamfoto). Auf www und
// go. erreichbar; die Auswahl (5 Sterne, Laenge, Thema, ohne Staedtenamen)
// trifft wie beim Standort pickAdsV2Reviews in der Seite.
import { ADS_TEMPLATE_V2_LOCATIONS } from "#shared/adsTemplateV2";

export default defineEventHandler(async (event) => {
  const all = await Promise.all(
    ADS_TEMPLATE_V2_LOCATIONS.map((l) => {
      const [city, loc] = l.split("/");
      return adsTemplateV2Extras(event, city!, loc!, "de").catch(() => ({ reviews: [] as any[] }));
    }),
  );
  const reviews = all.flatMap((x) => x?.reviews ?? []);
  setHeader(event, "Cache-Control", "public, max-age=60, s-maxage=300");
  return { reviews, doctors: [] };
});
