/**
 * E24 #395: interne Links zu den Seiten "Behandlung je Standort".
 *
 * Auf myhealthandbeauty.app verlinkte jede Seite ueber das Menue auf rund
 * 470 Stadtseiten (Wayback, Januar 2026). Heute bekommt eine Standortseite
 * Links nur vom Hub, von ihrer Standortseite und von wenigen Nachbarseiten;
 * Startseite und Blog-Uebersicht verlinken keine einzige (gemessen
 * 05.11.2026). Zwei Bausteine gleichen das aus, ohne Mega-Menue:
 *   - jede Standortseite verlinkt dieselbe Behandlung in den anderen Staedten,
 *   - der Footer (www) verlinkt je Stadt die gefragtesten Behandlungen.
 * Klinik-Standorte (MediaPark) bleiben aussen vor, dort gibt es nur OPs.
 */

export type BookableLocation = {
  slug?: string | null;
  type?: string | null;
  city?: { slug?: string | null; name?: string | null } | null;
};

export type CityLink = { label: string; href: string };

/** Lounges mit Stadt, alphabetisch nach Stadt. */
function lounges(locations: BookableLocation[] | null | undefined) {
  return (locations ?? [])
    .filter((l) => l?.slug && l.city?.slug && l.city?.name && l.type !== "clinic")
    .sort((a, b) => String(a.city!.name).localeCompare(String(b.city!.name), "de"));
}

/** Dieselbe Behandlung an den anderen Standorten ("Botox Köln", ...). */
export function otherCityLinks(
  locations: BookableLocation[] | null | undefined,
  pathKey: string,
  currentLocationSlug: string,
  treatmentName: string,
): CityLink[] {
  const key = pathKey.replace(/^\/+|\/+$/g, "");
  const name = treatmentName.replace(/®/g, "").trim();
  if (!key || !name) return [];
  return lounges(locations)
    .filter((l) => l.slug !== currentLocationSlug)
    .map((l) => ({
      label: `${name} ${l.city!.name}`,
      href: `/standorte/${l.city!.slug}/${l.slug}/${key}`,
    }));
}

/** Gefragteste Behandlungen je Stadt fuer den Footer. */
export const FOOTER_CITY_TREATMENTS: ReadonlyArray<{ pathKey: string; name: string }> = [
  { pathKey: "botox", name: "Botox" },
  { pathKey: "hyaluron/lippen-aufspritzen", name: "Lippen aufspritzen" },
  { pathKey: "hyaluron", name: "Hyaluron" },
];

export type FooterCity = { city: string; href: string; links: CityLink[] };

export function footerCityLinks(locations: BookableLocation[] | null | undefined): FooterCity[] {
  return lounges(locations).map((l) => {
    const base = `/standorte/${l.city!.slug}/${l.slug}`;
    return {
      city: String(l.city!.name),
      href: base,
      links: FOOTER_CITY_TREATMENTS.map((t) => ({
        label: `${t.name} ${l.city!.name}`,
        href: `${base}/${t.pathKey}`,
      })),
    };
  });
}

/**
 * Kannibalisierung: Fuer "lippen aufspritzen köln kosten" rankten 9 eigene
 * URLs (Lip Flip, Hylase, Russian Lips ...), fuer "botox behandlung aachen"
 * 5 (SISTRIX, 05.11.2026). Nachbarseiten verweisen deshalb mit dem
 * Hauptbegriff auf die eine Seite, die fuer ihn ranken soll.
 */
const PRIMARY: ReadonlyArray<readonly [RegExp, string, string]> = [
  [/^(botox\/lipflip|hyaluron\/(russian-lips|lippenkorrektur|hylase))$/, "hyaluron/lippen-aufspritzen", "Lippen aufspritzen"],
  [/^botox\/(?!3-zonen)/, "botox", "Botox"],
  [/^hyaluron\/(?!lippen-aufspritzen$)/, "hyaluron", "Hyaluron"],
  [/^fettwegspritze\//, "fettwegspritze", "Fettwegspritze"],
  [/^infusionen\//, "infusionen", "Infusionen"],
];

/** Hauptseite am selben Standort, auf die eine Unterseite verweisen soll. */
export function primaryLink(pathKey: string, citySlug: string, locationSlug: string, cityName: string): CityLink | null {
  const key = pathKey.replace(/^\/+|\/+$/g, "");
  const hit = PRIMARY.find(([re]) => re.test(key));
  if (!hit || hit[1] === key || !citySlug || !locationSlug) return null;
  return { label: `${hit[2]} ${cityName}`.trim(), href: `/standorte/${citySlug}/${locationSlug}/${hit[1]}` };
}
