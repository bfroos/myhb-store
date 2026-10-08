/**
 * Standort-Kacheln (LocationItem / LocationTeasers): Titel, Ziel-URL,
 * Alt-Text und zugaenglicher Linkname (D-02, 08.10.2026).
 *
 * Audit 07.10.2026 auf /behandlungen/hyaluron/lippen-aufspritzen: Die Kacheln
 * hiessen nur "Berlin", "Köln" ..., der einzige Textlink lautete "Details".
 * Auf nationalen Behandlungsseiten tragen die Kacheln jetzt Behandlung und
 * Stadt ("Lippen aufspritzen Berlin"); der Titel ist der Link. Alles kommt
 * aus vorhandenen Daten (treatmentPage.name, location.city.name), keine
 * Behandlung ist hart kodiert.
 *
 * Welche Standorte erscheinen, entscheidet weiter myhb-cms
 * (/locations/bookable mit treatmentType + pathKey, Standort-Konsolidierung
 * #44): Köln MediaPark kommt dort fuer nichtoperative Behandlungen nicht mehr
 * vor, weil ihre lokale Seite per 301 auf Köln Arcaden zeigt.
 *
 * Reine Funktionen ohne Nuxt-Abhaengigkeit (Unit-Tests mit node --test).
 */

export type TeaserLocation = {
  documentId?: string | null;
  slug: string;
  name?: string | null;
  city?: { name?: string | null; slug?: string | null } | null;
};

const clean = (value?: string | null) => (value ?? "").replace(/\s+/g, " ").trim();

/**
 * Sichtbarer Kacheltitel. Mit Behandlung: "<Behandlung> <Stadt>". Ohne
 * Behandlung wie bisher: Stadt (mainInformation "city") oder Standortname.
 */
export function locationTeaserTitle(
  location: TeaserLocation,
  options: { treatmentName?: string | null; mainInformation?: "city" | "location" } = {},
): string {
  const city = clean(location.city?.name);
  const name = clean(location.name);
  const treatment = clean(options.treatmentName);
  if (treatment && city) return `${treatment} ${city}`;
  if (options.mainInformation === "location") return name || city;
  return city || name;
}

/**
 * Ziel der Kachel: lokale Behandlungsseite
 * /standorte/{stadt}/{standort}/{pathKey}, ohne Behandlung die Standortseite.
 * Ohne Stadt-Slug gibt es keinen gueltigen Link (null).
 */
export function locationTeaserPath(
  location: TeaserLocation,
  treatmentPathKey?: string | null,
): string | null {
  const citySlug = clean(location.city?.slug);
  const locationSlug = clean(location.slug);
  if (!citySlug || !locationSlug) return null;
  const base = `/standorte/${citySlug}/${locationSlug}`;
  const key = clean(treatmentPathKey).replace(/^\/+|\/+$/g, "");
  return key ? `${base}/${key}` : base;
}

/**
 * Alt-Text des Gebaeudefotos. Das Foto zeigt den Standort, deshalb
 * Standortname und Stadt (z. B. "MY HEALTH & BEAUTY Gesundbrunnen-Center,
 * Berlin"), nicht der in Strapi teils generische Medien-Alt-Text.
 */
export function locationTeaserImageAlt(location: TeaserLocation, brandName = "MY HEALTH & BEAUTY"): string {
  const name = clean(location.name);
  const city = clean(location.city?.name);
  const place = [name, city].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ");
  return place ? `${brandName} ${place}` : brandName;
}

/**
 * Jeder Standort hoechstens einmal (gleiche documentId bzw. Stadt+Slug).
 * Strapi lieferte bei locale-Abfragen schon doppelte Zeilen (siehe
 * myhb-cms locationConsolidation.ts), und Standorte ohne Stadt-Slug haben
 * keine gueltige Ziel-URL.
 */
export function uniqueTeaserLocations<T extends TeaserLocation>(locations: T[] | null | undefined): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const location of locations ?? []) {
    if (!location || !locationTeaserPath(location)) continue;
    const key = location.documentId || `${location.city?.slug}/${location.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(location);
  }
  return result;
}
