/**
 * E24 #312: Mindestpaket fuer eine indexierbare Stadtseite (Konzept 3.3,
 * myhb-app/myhb-os docs/seo-konzept-hub-stadtseiten-lippen-2026-10-12.md).
 *
 * "Lieber Canonical auf den Hub als ein duenner Klon": Eine Stadtseite
 * einer Behandlung aus LOCAL_GATE_PATH_KEYS darf sich nur selbst als
 * Canonical setzen und in die Sitemap, wenn sie eigenen lokalen Inhalt hat.
 * Sonst zeigt das Canonical auf den Hub (/behandlungen/<pathKey>), die URL
 * faellt aus der Sitemap, die Seite bleibt buchbar.
 *
 * Geprueft wird zweistufig:
 * - statisch (Inhalt im Code bzw. aus Strapi-localFacts): eigene Einleitung
 *   >= 80 Woerter mit Link zum Hub, Profilthema, Weg + Parken, >= 3 lokale
 *   FAQ. Das kann auch die Sitemap pruefen.
 * - auf der Seite zusaetzlich: Oeffnungszeiten, >= 1 Aerztin/Arzt am
 *   Standort, >= 3 Bewertungen dieses Google-Profils.
 * Die Wortfolge-Aehnlichkeit (Hub < 0,5, andere Stadt < 0,6) prueft der
 * Unit-Test bei jedem CI-Lauf fuer alle Stadttexte im Code.
 *
 * Abweichung vom Konzept: Der Hub-Link muss in der Einleitung stehen, nicht
 * im ersten Absatz. So sind die abgenommenen Pilottexte (18.10.2026) gebaut.
 */
import { paragraphText, seoPilotCity, type SeoCityContent } from "./seoPilotLippen.ts";

/**
 * Behandlungen, fuer die das Gate gilt. Leer = keine Seite aendert sich.
 * Einschalten je Behandlung ist eine SEO-Entscheidung (Benjamin, #346):
 * Alle Stadtseiten der Behandlung ohne eigenen Inhalt zeigen danach per
 * Canonical auf den Hub und verlassen die Sitemap.
 */
export const LOCAL_GATE_PATH_KEYS: readonly string[] = [];

/**
 * Kontrollgruppe des Lippen-Pilots (#311): bleibt bis zur 8-Wochen-
 * Nachmessung (13.12.2026) unveraendert, auch wenn das Gate an ist.
 */
export const LOCAL_GATE_EXEMPT: Readonly<Record<string, readonly string[]>> = {
  "hyaluron/lippen-aufspritzen": ["leipzig/hoefe-am-bruehl", "aachen/aquis-plaza"],
};

export const MIN_INTRO_WORDS = 80;
export const MIN_LOCAL_FAQS = 3;
export const MIN_REVIEWS = 3;
export const MIN_DOCTORS = 1;
export const MAX_SIMILARITY_HUB = 0.5;
export const MAX_SIMILARITY_CITY = 0.6;

export type LocalGateMissing =
  | "content"
  | "intro"
  | "hubLink"
  | "profile"
  | "directions"
  | "parking"
  | "faqs"
  | "openingHours"
  | "doctors"
  | "reviews";

export type LocalGateResult = { indexable: boolean; missing: LocalGateMissing[] };

/** Daten, die erst die Seite kennt. Fehlt ein Wert, wird er nicht geprueft. */
export type LocalGatePageData = {
  hasOpeningHours?: boolean;
  doctors?: number;
  reviews?: number;
};

function normKey(pathKey: string | null | undefined): string {
  return String(pathKey ?? "").replace(/^\/+|\/+$/g, "");
}

export function hubPathFor(pathKey: string | null | undefined): string {
  return `/behandlungen/${normKey(pathKey)}`;
}

/** Gilt das Gate fuer diese Stadtseite? */
export function isLocalGateActive(
  pathKey: string | null | undefined,
  citySlug: string | null | undefined,
  locationSlug: string | null | undefined,
  gated: readonly string[] = LOCAL_GATE_PATH_KEYS,
): boolean {
  const key = normKey(pathKey);
  if (!key || !gated.includes(key)) return false;
  return !(LOCAL_GATE_EXEMPT[key] ?? []).includes(`${citySlug}/${locationSlug}`);
}

export function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** Eigener lokaler Inhalt einer Stadtseite (statisch + Seitendaten). */
export function localContentGate(
  content: SeoCityContent | null | undefined,
  hubPath: string,
  page: LocalGatePageData = {},
): LocalGateResult {
  if (!content) return { indexable: false, missing: ["content"] };
  const missing: LocalGateMissing[] = [];
  const intro = content.intro ?? [];
  if (wordCount(intro.map(paragraphText).join(" ")) < MIN_INTRO_WORDS) missing.push("intro");
  const hub = hubPath.replace(/\/+$/, "");
  const linksHub = intro.some((p) =>
    p.some((x) => typeof x !== "string" && x.href.replace(/[#?].*$/, "").replace(/\/+$/, "") === hub),
  );
  if (!linksHub) missing.push("hubLink");
  if (!content.profileHeadline?.trim() || !content.profile?.length) missing.push("profile");
  if (!content.whereSteps?.length || !(content.transit?.length || content.car?.length)) missing.push("directions");
  if (!content.parking?.length) missing.push("parking");
  if ((content.faqs?.length ?? 0) < MIN_LOCAL_FAQS) missing.push("faqs");
  if (page.hasOpeningHours === false) missing.push("openingHours");
  if (page.doctors !== undefined && page.doctors < MIN_DOCTORS) missing.push("doctors");
  if (page.reviews !== undefined && page.reviews < MIN_REVIEWS) missing.push("reviews");
  return { indexable: missing.length === 0, missing };
}

/**
 * Canonical-Pfad einer Stadtseite: null = eigene URL (wie bisher),
 * sonst der Hub.
 */
export function localGateCanonical(
  pathKey: string | null | undefined,
  citySlug: string | null | undefined,
  locationSlug: string | null | undefined,
  content: SeoCityContent | null | undefined,
  page: LocalGatePageData = {},
  gated: readonly string[] = LOCAL_GATE_PATH_KEYS,
): string | null {
  if (!isLocalGateActive(pathKey, citySlug, locationSlug, gated)) return null;
  const hub = hubPathFor(pathKey);
  return localContentGate(content, hub, page).indexable ? null : hub;
}

/**
 * Sitemap: gehoert die Stadtseite hinein? Prueft nur den statischen Teil,
 * mit dem Inhalt aus dem Code (Strapi-localFacts fuellen dort nur Felder,
 * die es im Code schon gibt).
 */
export function localGateInSitemap(
  pathKey: string | null | undefined,
  citySlug: string,
  locationSlug: string,
  gated: readonly string[] = LOCAL_GATE_PATH_KEYS,
): boolean {
  if (!isLocalGateActive(pathKey, citySlug, locationSlug, gated)) return true;
  const content = seoPilotCity(citySlug, locationSlug, normKey(pathKey));
  return localContentGate(content, hubPathFor(pathKey)).indexable;
}

// ------------------------------------------------- Wortfolge-Aehnlichkeit

/** Woerter klein, Satzzeichen weg, Orts-/Centernamen durch "ort" ersetzt. */
export function neutralizedWords(text: string, names: string[] = []): string[] {
  let t = text.toLowerCase();
  for (const n of names.filter(Boolean).sort((a, b) => b.length - a.length)) {
    t = t.split(n.toLowerCase()).join(" ort ");
  }
  return t
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Aehnlichkeit zweier Wortfolgen, 0..1: 2 * LCS / (|a| + |b|), wie
 * difflib.SequenceMatcher.ratio() in der Analyse vom 12.10.2026.
 */
export function wordSequenceSimilarity(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 1;
  if (!a.length || !b.length) return 0;
  let prev = new Uint16Array(b.length + 1);
  let cur = new Uint16Array(b.length + 1);
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    [prev, cur] = [cur, prev];
    cur.fill(0);
  }
  return (2 * prev[b.length]) / (a.length + b.length);
}

/** Eigener Text einer Stadtseite (Einleitung, Profilthema, FAQ). */
export function cityOwnText(c: SeoCityContent): string {
  return [
    ...c.intro.map(paragraphText),
    c.profileHeadline,
    ...c.profile.map(paragraphText),
    ...c.faqs.flatMap((f) => [f.question, paragraphText(f.answer)]),
  ].join(" ");
}
