// E24: sprachliche Korrekturen der Strapi-Ueberschriften je Seite
// (shared/headlineFixes.ts). Nur die Paare der angefragten Seite gehen raus.
import fixes from "../assets/headline-fixes.json";
import type { HeadlineFixes } from "#shared/headlineFixes";

const FIXES = fixes as Record<string, HeadlineFixes>;

export default defineEventHandler((event) => {
  const key = String(getQuery(event).key ?? "");
  setResponseHeader(event, "Cache-Control", "public, max-age=300, s-maxage=3600");
  return FIXES[key] ?? {};
});
