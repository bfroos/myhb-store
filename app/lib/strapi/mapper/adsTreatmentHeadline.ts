import { adsH1, adsSubline } from "#shared/adsHeadlines";

/**
 * go.* (Ads-Modus): H1 und Unterzeile in Suchsprache (#186, 30.09.2026).
 *
 * Die Formulierungen stehen in shared/adsHeadlines.ts ("Stirnfalte glätten
 * in Köln" statt "Stirnfalte Köln"). Sie sind deutsch; andere Sprachen
 * behalten ihre normale H1.
 *
 * `null` = kein Sondertitel, die Seite nimmt ihren normalen H1.
 */
export function adsTreatmentHeadline(
  pathKey: string | null | undefined,
  city?: string | null,
  localeCode?: string | null,
): string | null {
  if (!String(localeCode || "de").startsWith("de")) return null;
  return adsH1(pathKey, city);
}

/** Unterzeile fuer go.: generische Strapi-Unterzeile -> konkrete (nur de). */
export function adsTreatmentSubline(
  pathKey: string | null | undefined,
  strapiSubline: string | null | undefined,
  localeCode?: string | null,
): string | null | undefined {
  if (!String(localeCode || "de").startsWith("de")) return strapiSubline;
  return adsSubline(pathKey, strapiSubline);
}
