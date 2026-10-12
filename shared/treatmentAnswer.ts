/**
 * E24 #314: Kurzantwort oben auf Behandlungs- und Stadtseiten (www).
 *
 * KI-Antworten (AI Overviews, Copilot, ChatGPT) zitieren einen sachlichen
 * Absatz, der in drei bis vier Saetzen sagt: was ist es, was kostet es, wie
 * lange dauert/haelt es, wer behandelt, wo. Bausteine:
 * - "So wirkt es" und Steckbrief aus der go.-Vorlage
 *   (shared/adsTemplateV2Content.ts, dort schon redigiert: kein Markenname,
 *   kein Heilversprechen),
 * - Preis aus Strapi (nie aus dem Text),
 * - auf Stadtseiten Stadt und Center.
 * Kategorie-Seiten (Faltenbehandlung, Hyaluron, ...) haben eigene Saetze.
 * Ohne passende Bausteine: keine Kurzantwort (lieber nichts als Fuellsaetze).
 */
import { adsV2Facts, adsV2Terms } from "./adsTemplateV2Content.ts";
import { seoTitleFor } from "./seoTitles.ts";

/** www-pathKey -> Schluessel der go.-Inhalte (dort heisst "botox" "muskelrelaxans"). */
const KEY_MAP: Record<string, string> = {
  "botox/full-face-botox": "muskelrelaxans/full-face-muskelrelaxans",
  "botox/barbie-botox": "muskelrelaxans/barbie-muskelrelaxans",
};

function contentKey(pathKey: string): string {
  if (KEY_MAP[pathKey]) return KEY_MAP[pathKey]!;
  return pathKey.replace(/^botox\//, "muskelrelaxans/");
}

/** Kategorie-Seiten: was die Kategorie ist (ohne Preis, der kommt dazu). */
const CATEGORY_WHAT: Record<string, string> = {
  botox:
    "Bei der Faltenbehandlung mit Muskelrelaxans (Wirkstoff Botulinumtoxin) wird der Muskel, der eine Mimikfalte verursacht, gezielt entspannt – etwa an Stirn, Zornesfalte oder Krähenfüßen. Die Haut darüber glättet sich, die Mimik bleibt.",
  hyaluron:
    "Hyaluronsäure ist ein Stoff, den der Körper selbst bildet und der Feuchtigkeit bindet. Als Gel unter die Haut gesetzt, kann es Volumen aufbauen, Konturen betonen und Falten auffüllen – an Lippen, Wangen, Kinn oder Nasolabialfalten.",
  skinbooster:
    "Skinbooster verteilen sich flächig in der Haut und versorgen sie mit Feuchtigkeit und Wirkstoffen. Sie bauen kein Volumen auf, sondern zielen auf die Hautqualität – etwa Profhilo®, Mesotherapie, Polynukleotide oder PRP.",
  infusionen:
    "Bei einer Infusion läuft eine Lösung mit Vitaminen und Mineralstoffen langsam über einen dünnen Zugang in eine Vene am Arm. Welche Infusion passt, bespricht die Ärztin oder der Arzt vorher mit dir.",
  "anti-haarausfall":
    "Bei Haarausfall kommen PRP aus dem eigenen Blut oder eine Mesotherapie der Kopfhaut infrage. Was sinnvoll ist, klärt die Ärztin oder der Arzt nach einer Untersuchung.",
};

/** Seiten ohne Kurzantwort: Lippen-Pilot (eigene), OPs, Sonderseiten. */
const EXCLUDE = [/^hyaluron\/lippen-aufspritzen$/, /^schoenheitsoperationen/, /kostenlose-haaranalyse/, /hair-boost/, /3-zonen-botox-preise/];

export type AnswerInput = {
  pathKey: string | null | undefined;
  name: string | null | undefined;
  priceInEuroCent?: number | null;
  isStartingPrice?: boolean | null;
  /** Stadtseite: "Köln" */
  city?: string | null;
  /** Stadtseite: "Köln Arcaden" */
  center?: string | null;
  /** Bundesweit: Anzahl Standorte */
  locationCount?: number;
};

function euro(cent: number): string {
  return `${(cent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

function stripCa(v: string): string {
  return v.replace(/^ca\.\s*/, "");
}

/** Kurzantwort als Absaetze (2-4 Saetze) oder null. */
export function treatmentAnswer(input: AnswerInput): string | null {
  const pathKey = String(input.pathKey ?? "").replace(/^\/+|\/+$/g, "");
  if (!pathKey || EXCLUDE.some((re) => re.test(pathKey))) return null;
  const price = input.priceInEuroCent ? `${input.isStartingPrice === false ? "" : "ab "}${euro(input.priceInEuroCent)}` : null;
  const where = input.city ? ` in ${input.city}${input.center ? ` (${input.center})` : ""}` : "";

  const sentences: string[] = [];
  const terms = adsV2Terms(contentKey(pathKey));
  const category = CATEGORY_WHAT[pathKey];
  if (terms?.howItWorks) sentences.push(terms.howItWorks);
  else if (category) sentences.push(category);
  else return null;

  if (price) {
    sentences.push(
      category
        ? `Bei MY HEALTH & BEAUTY${where} beginnen die Preise bei ${euro(input.priceInEuroCent!)}.`
        : `Bei MY HEALTH & BEAUTY${where} kostet die Behandlung ${price}.`,
    );
  }

  if (terms) {
    const facts = adsV2Facts(contentKey(pathKey));
    const get = (k: string) => facts.find((f) => f.key === k)?.value;
    const dauer = get("dauer");
    const halt = get("haltbarkeit");
    const parts: string[] = [];
    if (dauer) parts.push(`dauert ${dauer}`);
    if (halt) parts.push(`das Ergebnis hält meist ${stripCa(halt)}`);
    if (parts.length) sentences.push(`Die Behandlung ${parts.join(", ")}.`);
  }

  sentences.push(
    input.city
      ? "Es behandeln ausschließlich Ärztinnen und Ärzte; spontan geht es nach Verfügbarkeit auch ohne Termin."
      : `Es behandeln ausschließlich Ärztinnen und Ärzte, an ${input.locationCount ?? 9} Standorten in Deutschland, nach Verfügbarkeit auch ohne Termin.`,
  );
  return sentences.join(" ");
}

const CATEGORY_LABEL: Record<string, string> = {
  botox: "Faltenbehandlung mit Muskelrelaxans",
  hyaluron: "Hyaluron-Behandlung",
  skinbooster: "Skinbooster",
  infusionen: "Infusionen",
  "anti-haarausfall": "Haarausfall-Behandlung",
};

/** Ueberschrift der Kurzantwort: Suchbegriff (wie H1) + Stadt. */
export function answerHeadline(pathKey: string | null | undefined, name: string | null | undefined, city?: string | null): string {
  const key = String(pathKey ?? "").replace(/^\/+|\/+$/g, "");
  const label = CATEGORY_LABEL[key] ?? seoTitleFor(key, null)?.h1 ?? String(name ?? "").replace(/®/g, "").trim();
  return `${label}${city ? ` in ${city}` : ""} auf einen Blick`;
}
