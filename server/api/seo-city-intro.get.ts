// E24 #421: Einleitung je Stadtseite (shared/cityIntros.ts).
import intros from "../assets/city-intros.json";
import type { CityIntro } from "#shared/cityIntros";

const INTROS = Object.fromEntries((intros as CityIntro[]).map((i) => [i.citySlug, i]));

export default defineEventHandler((event) => {
  const city = String(getQuery(event).city ?? "").toLowerCase();
  setResponseHeader(event, "Cache-Control", "public, max-age=300, s-maxage=3600");
  return INTROS[city] ?? null;
});
