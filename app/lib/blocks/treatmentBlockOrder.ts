/**
 * Reihenfolge der Behandlungs-Bloecke - EINZIGE Quelle der Wahrheit.
 *
 * Vorher lag die Reihenfolge doppelt vor: hartkodiert im Template von
 * TreatmentCommonBlocks.vue (fuer /behandlungen) und als Array auf der
 * Standortseite. Beide waren deckungsgleich, mussten aber von Hand synchron
 * gehalten werden - eine Aenderung an einer Stelle haette die beiden
 * Seitentypen unbemerkt auseinanderlaufen lassen.
 *
 * Die Keys entsprechen den Eintraegen in BLOCK_MAP
 * (components/pages/treatment/OrderedBlocks.vue) und der Enum in
 * myhb-cms: components/location-treatment-page/block-ref.json.
 */

/**
 * Gemeinsamer Teil, identisch auf /behandlungen und auf den Standortseiten.
 * Enthaelt bewusst KEIN "hero": den rendert /behandlungen separat vor der
 * Reviewer-Signatur.
 */
export const COMMON_TREATMENT_BLOCK_ORDER: string[] = [
  "tableOfContents",
  "about",
  "reviews",
  "treatmentDetails",
  "treatmentPlan",
  "benefits",
  "suitability",
  "medicalTeamHighlight",
  "treatmentProcess",
  "relatedTreatments",
  "faq",
];

/**
 * Standortseite im SEO-Modus: Hero, dann die Standort-Bloecke, dann der
 * gemeinsame Teil. "blocks" (Dynamic Zone) steht am Ende - ohne Eintrag hier
 * wuerde ein am Standort gepflegter Zusatzblock nie gerendert.
 */
export const LOCATION_SEO_BLOCK_ORDER: string[] = [
  "hero",
  "locationContact",
  "aboutLocation",
  "locationDirections",
  ...COMMON_TREATMENT_BLOCK_ORDER,
  "blocks",
];

/**
 * Standortseite im Ads-Modus: bewusst eine ANDERE Reihenfolge (Conversion
 * zuerst, Standort-Infos und FAQ ans Ende). Laesst sich deshalb nicht aus dem
 * gemeinsamen Teil ableiten und bleibt explizit - dieselben Keys, andere
 * Sortierung. Die Konsistenz der Key-MENGE prueft der Check unten.
 */
export const LOCATION_ADS_BLOCK_ORDER: string[] = [
  "hero",
  "about",
  "reviews",
  "treatmentDetails",
  "relatedTreatments",
  "treatmentProcess",
  "benefits",
  "medicalTeamHighlight",
  "suitability",
  "tableOfContents",
  "treatmentPlan",
  "locationContact",
  "aboutLocation",
  "locationDirections",
  "faq",
  "blocks",
];

// Entwicklungs-Check: SEO- und Ads-Reihenfolge muessen dieselben Bloecke
// enthalten, nur anders sortiert. Faellt sonst erst im Browser auf, wenn in
// einem der beiden Modi ein Abschnitt fehlt.
if (import.meta.dev) {
  const seoKeys = new Set(LOCATION_SEO_BLOCK_ORDER);
  const adsKeys = new Set(LOCATION_ADS_BLOCK_ORDER);
  const onlyInSeo = LOCATION_SEO_BLOCK_ORDER.filter((key) => !adsKeys.has(key));
  const onlyInAds = LOCATION_ADS_BLOCK_ORDER.filter((key) => !seoKeys.has(key));

  if (onlyInSeo.length > 0 || onlyInAds.length > 0) {
    console.warn(
      "[blockOrder] SEO- und Ads-Reihenfolge enthalten unterschiedliche Bloecke.",
      { onlyInSeo, onlyInAds },
    );
  }
}
