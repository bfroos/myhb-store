/**
 * go.* (Ads-Modus): Auswahlseiten statt der alten Uebersichtsseiten
 * (Benjamin, 08.10.2026: "die Übersichtsseite, also bspw. Muskelrelaxans
 * ohne Stadt", sieht noch alt aus; Weg 1 = umleiten, Ziel = kleine
 * Auswahlseite im neuen Look).
 *
 * Neu sind nur die Standort-Behandlungsseiten (Vorlage v2). Alles darueber
 * (Startseite, /behandlungen/..., /standorte/... ohne Behandlung) hatte noch
 * das www-Layout. Auf go. leiten diese Seiten jetzt (302) auf:
 *
 * - /standort-waehlen[/<kategorie>[/<behandlung>]]
 *   ohne Standort: erst Behandlung, dann Standort -> v2-Seite
 * - /behandlung-waehlen/<stadt>/<standort>[/<kategorie>]
 *   mit Standort: Behandlung waehlen -> v2-Seite
 *
 * Nur, was es in v2 wirklich gibt (ADS_TEMPLATE_V2_LOCATIONS x
 * ADS_TEMPLATE_V2_TREATMENTS, alle 39 an allen 9 Standorten). Alles andere
 * (Fettwegspritze, Schoenheits-OPs, /preise, /p/..., Sprachen) bleibt, wie es
 * ist. www bleibt unberuehrt.
 */
import { ADS_TEMPLATE_V2_LOCATIONS, ADS_TEMPLATE_V2_TREATMENTS } from "./adsTemplateV2.ts";

export const ADS_CHOOSER_PATH = "/standort-waehlen";
export const ADS_LOCATION_CHOOSER_PATH = "/behandlung-waehlen";

export type AdsChooserLocation = { key: string; city: string; name: string };

/** Anzeigenamen der v2-Standorte (Reihenfolge = Anzeige, alphabetisch nach Stadt). */
const LOCATION_NAMES: Readonly<Record<string, { city: string; name: string }>> = {
  "aachen/aquis-plaza": { city: "Aachen", name: "Aquis Plaza" },
  "berlin/gesundbrunnencenter": { city: "Berlin", name: "Gesundbrunnen-Center" },
  "duesseldorf/duesseldorf-arcaden": { city: "Düsseldorf", name: "Düsseldorf Arcaden" },
  "duisburg/forum": { city: "Duisburg", name: "Forum Duisburg" },
  "kaiserslautern/k-in-lautern": { city: "Kaiserslautern", name: "K in Lautern" },
  "koeln/koeln-arcaden": { city: "Köln", name: "Köln Arcaden" },
  "leipzig/hoefe-am-bruehl": { city: "Leipzig", name: "Höfe am Brühl" },
  "moenchengladbach/minto": { city: "Mönchengladbach", name: "Minto" },
  "recklinghausen/palais-vest": { city: "Recklinghausen", name: "Palais Vest" },
};

export const ADS_CHOOSER_CATEGORIES: ReadonlyArray<{ key: string; label: string }> = [
  { key: "hyaluron", label: "Hyaluron" },
  { key: "muskelrelaxans", label: "Muskelrelaxans" },
  { key: "skinbooster", label: "Skinbooster" },
  { key: "infusionen", label: "Infusionen" },
  { key: "anti-haarausfall", label: "Anti-Haarausfall" },
];

export function adsChooserLocations(): AdsChooserLocation[] {
  return ADS_TEMPLATE_V2_LOCATIONS.map((key) => ({
    key,
    city: LOCATION_NAMES[key]?.city ?? key.split("/")[0]!,
    name: LOCATION_NAMES[key]?.name ?? key.split("/")[1]!,
  })).sort((a, b) => a.city.localeCompare(b.city, "de"));
}

export function adsChooserLocation(city: string, loc: string): AdsChooserLocation | null {
  return adsChooserLocations().find((l) => l.key === `${city}/${loc}`) ?? null;
}

export function adsChooserCategory(key: string): { key: string; label: string } | null {
  return ADS_CHOOSER_CATEGORIES.find((c) => c.key === key) ?? null;
}

/** pathKeys der Kategorie in der Reihenfolge von ADS_TEMPLATE_V2_TREATMENTS. */
export function adsChooserTreatments(category: string): string[] {
  return ADS_TEMPLATE_V2_TREATMENTS.filter((k) => k.startsWith(`${category}/`));
}

export function isAdsChooserTreatment(pathKey: string): boolean {
  return ADS_TEMPLATE_V2_TREATMENTS.includes(pathKey);
}

/** Stadt mit genau einem v2-Standort -> dessen Schluessel, sonst null. */
function onlyLocationOfCity(city: string): string | null {
  const hits = ADS_TEMPLATE_V2_LOCATIONS.filter((k) => k.startsWith(`${city}/`));
  return hits.length === 1 ? hits[0]! : null;
}

/**
 * Ziel der Umleitung auf eine Auswahlseite oder `null` (Seite bleibt).
 * `path` ist normalisiert (ohne Query, ohne Schraegstrich am Ende).
 */
export function adsChooserRedirectTarget(path: string): string | null {
  if (path === "/" || path === "/behandlungen" || path === "/standorte") return ADS_CHOOSER_PATH;

  const t = /^\/behandlungen\/([^/]+)(?:\/([^/]+))?$/.exec(path);
  if (t) {
    const cat = t[1]!;
    if (!adsChooserCategory(cat)) return null;
    const key = t[2] ? `${cat}/${t[2].replace(/-rabatt$/, "")}` : null;
    if (key && isAdsChooserTreatment(key)) return `${ADS_CHOOSER_PATH}/${key}`;
    return `${ADS_CHOOSER_PATH}/${cat}`;
  }

  const s = /^\/standorte\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/.exec(path);
  if (s) {
    const [, city, loc, cat] = s;
    const locKey = loc ? `${city}/${loc}` : onlyLocationOfCity(city!);
    if (!locKey || !ADS_TEMPLATE_V2_LOCATIONS.includes(locKey)) return null;
    if (cat) {
      return adsChooserCategory(cat) ? `${ADS_LOCATION_CHOOSER_PATH}/${locKey}/${cat}` : null;
    }
    return `${ADS_LOCATION_CHOOSER_PATH}/${locKey}`;
  }
  return null;
}
