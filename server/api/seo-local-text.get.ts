// E24 #396: eigene Texte je Seite "Behandlung je Standort"
// (shared/seoLocalTexts.ts). Nur der Eintrag der angefragten Seite geht
// raus, nicht die ganze Datei.
import texts from "../assets/seo-local-texts.json";
import type { SeoLocalText } from "#shared/seoLocalTexts";

const TEXTS = texts as Record<string, SeoLocalText>;

export default defineEventHandler((event) => {
  const key = String(getQuery(event).key ?? "");
  setResponseHeader(event, "Cache-Control", "public, max-age=300, s-maxage=3600");
  return TEXTS[key] ?? null;
});
