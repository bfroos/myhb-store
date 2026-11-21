/**
 * Filialen ohne Eroeffnungsdatum ("coming soon"), Entscheidung Benjamin 21.11.2026:
 *
 * - Nur Saarbruecken ist wirklich geplant. Die Seiten sollen schon jetzt
 *   Rankings sammeln, deshalb indexierbar und in der Sitemap, obwohl die
 *   Filiale noch nicht buchbar ist. Mit noindex reift eine Seite nicht, Google
 *   nimmt sie nur nach und nach aus dem Index.
 * - Bielefeld, Koblenz, Wuppertal und Magdeburg sind nicht geplant. Ihre Seiten
 *   ranken trotzdem noch (z. B. Magdeburg Fettwegspritze Platz 4) und leiten
 *   per 301 auf die naechste offene Filiale, Unterseite fuer Unterseite. Die
 *   Behandlungslisten sind an Quelle und Ziel identisch (62 Seiten, 21.11.).
 *
 * Reine Funktionen ohne Nuxt-Abhaengigkeit (Unit-Tests mit node --test).
 */

/** "stadt/filiale" (klein geschrieben) -> "stadt/filiale" der Ziel-Filiale. */
export const UMGELEITETE_STANDORTE: Readonly<Record<string, string>> = {
  "bielefeld/loom": "recklinghausen/palais-vest",
  "koblenz/loehr-center": "koeln/koeln-arcaden",
  "wuppertal/city-arkaden-wuppertal": "duesseldorf/duesseldorf-arcaden",
  "city/allee-center-magdeburg": "leipzig/hoefe-am-bruehl",
};

/** Stadtseiten der nicht geplanten Filialen ("city" nutzt nur Magdeburg). */
export const UMGELEITETE_STAEDTE: Readonly<Record<string, string>> = {
  bielefeld: "recklinghausen",
  koblenz: "koeln",
  wuppertal: "duesseldorf",
  city: "leipzig",
  magdeburg: "leipzig",
};

/** Coming-soon-Filialen, die trotzdem in Index und Sitemap sollen. */
export const INDEXIERBARE_GEPLANTE_STANDORTE: ReadonlySet<string> = new Set([
  "saarbruecken/europa-galerie",
]);

const STANDORT_PREFIXE = ["standorte", "locations", "konumlar", "mawaqea", "lieux", "locaties"];
const SPRACHEN = ["en", "tr", "ar", "fr", "nl"];

const MUSTER = new RegExp(
  `^(/(?:${SPRACHEN.join("|")}))?/(${STANDORT_PREFIXE.join("|")})/([^/]+)(?:/([^/]+))?(/.*)?$`,
  "i",
);

function key(citySlug?: string | null, locationSlug?: string | null): string {
  return `${(citySlug ?? "").toLowerCase()}/${(locationSlug ?? "").toLowerCase()}`;
}

/** true, wenn die Filiale umgeleitet wird (fuer Listen und Karten ausblenden). */
export function istUmgeleiteterStandort(citySlug?: string | null, locationSlug?: string | null): boolean {
  return key(citySlug, locationSlug) in UMGELEITETE_STANDORTE;
}

/** true, wenn eine Coming-soon-Filiale trotzdem indexiert werden soll. */
export function istIndexierbarerGeplanterStandort(
  citySlug?: string | null,
  locationSlug?: string | null,
): boolean {
  return INDEXIERBARE_GEPLANTE_STANDORTE.has(key(citySlug, locationSlug));
}

/** true, wenn die Stadt eine indexierbare geplante Filiale hat. */
export function istIndexierbareGeplanteStadt(citySlug?: string | null): boolean {
  const c = (citySlug ?? "").toLowerCase();
  return [...INDEXIERBARE_GEPLANTE_STANDORTE].some((k) => k.startsWith(`${c}/`));
}

/**
 * Ziel der 301-Weiterleitung fuer Seiten nicht geplanter Filialen, sonst null.
 * Behaelt Sprachpraefix, Standort-Praefix, Unterpfad und Query.
 */
export function geplanterStandortZiel(pathname: string, search = ""): string | null {
  const m = MUSTER.exec(pathname.replace(/\/+$/, "") || "/");
  if (!m) return null;
  const [, sprache = "", prefix, stadt, filiale, rest = ""] = m;
  if (filiale) {
    const ziel = UMGELEITETE_STANDORTE[key(stadt, filiale)];
    if (ziel) return `${sprache}/${prefix}/${ziel}${rest}${search}`;
    return null;
  }
  const zielStadt = UMGELEITETE_STAEDTE[(stadt ?? "").toLowerCase()];
  return zielStadt ? `${sprache}/${prefix}/${zielStadt}${search}` : null;
}
