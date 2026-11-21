/**
 * E24 #317: Fragen mit Kauf- und Entscheidungsabsicht je Behandlung (www).
 *
 * Die Strapi-FAQs sind ueberwiegend allgemein ("Was ist Hyaluron?"). Es
 * fehlen die Fragen, die vor einer Buchung gestellt werden (Analyse,
 * Abschnitt 5): Was kostet es? Was ist inklusive? Geht es ohne Termin? Ist
 * die Beratung kostenlos? Wann sehe ich etwas, wie lange haelt es? Tut es
 * weh? Was, wenn es mir nicht gefaellt?
 *
 * Medizinische Antworten kommen aus der go.-Vorlage
 * (shared/adsTemplateV2Content.ts, adsV2FaqsV2) - dort seit 01.10.2026
 * geprueft und live, ohne Markennamen und ohne Heilversprechen. Neu sind nur
 * die Kauf-Fragen; Preise kommen aus Strapi. Fragen, die Strapi schon
 * beantwortet (gleiches Thema), fallen weg, damit nichts doppelt steht.
 */
import { adsV2FaqsV2, adsV2Terms } from "./adsTemplateV2Content.ts";
import { adsV2Guarantee } from "./adsTemplateV2.ts";

export type PurchaseFaq = { question: string; answer: string; topic: string };

const KEY_MAP: Record<string, string> = {
  "botox/full-face-botox": "muskelrelaxans/full-face-muskelrelaxans",
  "botox/barbie-botox": "muskelrelaxans/barbie-muskelrelaxans",
};
function contentKey(pathKey: string): string {
  return KEY_MAP[pathKey] ?? pathKey.replace(/^botox\//, "muskelrelaxans/");
}

const EXCLUDE = [/^hyaluron\/lippen-aufspritzen$/, /^schoenheitsoperationen/];

/** Themen-Erkennung fuer vorhandene Strapi-Fragen (Dubletten vermeiden). */
const TOPIC_PATTERNS: Record<string, RegExp> = {
  cost: /kost|preis|teuer|bezahl/i,
  included: /inklusive|enthalten|im preis/i,
  walkin: /ohne termin|spontan|wartezeit|termin bekomm/i,
  consult: /beratung.*kostenlos|kostenlos.*beratung/i,
  timing: /wann sehe|wie lange h[äa]lt|haltbarkeit|wirkung ein|wie schnell/i,
  pain: /weh|schmerz/i,
  side: /nebenwirk|risik/i,
  undo: /r[üu]ckg[äa]ngig|aufl[öo]sen|nicht gef[äa]llt|unzufrieden/i,
  who: /wer behandelt|wer f[üu]hrt|arzt|ärztin/i,
};

/**
 * E24 Nachmessung 21.11.2026 (myhb-os docs/seo-nachmessung-2026-11-18.md):
 * Suchbegriffe, fuer die die Seite schon auf Platz 11 steht. Die Frage
 * enthaelt den Suchbegriff woertlich, damit Google die Seite als Antwort
 * erkennt. Steht immer (auch wenn Strapi schon eine Kostenfrage hat) und
 * ersetzt nur die eigene allgemeine Kostenfrage. Nur mit Preis aus Strapi.
 */
const KEYWORD_COST_QUESTION: Record<string, (where: string) => string> = {
  "skinbooster/profhilo": (w) => `Was kostet eine Profhilo-Behandlung${w}?`,
  "skinbooster/mesotherapie-nctf-135-ha": (w) => `Was kostet Mesotherapie fürs Gesicht${w}?`,
  "hyaluron/wangenaufbau": (w) => `Was kostet es, die Wangen aufspritzen zu lassen${w}?`,
  "hyaluron/kinnkorrektur": (w) => `Was kostet Hyaluronsäure am Kinn${w}?`,
  "botox/zornesfalte": (w) => `Welche Preise gelten für die Behandlung der Zornesfalte${w}?`,
  "botox/migraenebehandlung": (w) => `Was kostet eine Botulinumtoxin-Behandlung gegen Migräne${w}?`,
};

export function keywordCostFaq(pathKey: string, priceText: string | null, where: string): PurchaseFaq | null {
  const q = KEYWORD_COST_QUESTION[pathKey];
  if (!q || !priceText) return null;
  return {
    topic: "keyword",
    question: q(where),
    answer: `Bei MY HEALTH & BEAUTY kostet die Behandlung ${priceText}. Der Preis gilt an allen unseren Standorten; das ärztliche Beratungsgespräch vorher ist kostenlos.`,
  };
}

function euro(cent: number): string {
  return `${(cent / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

export function purchaseFaqs(input: {
  pathKey: string | null | undefined;
  priceInEuroCent?: number | null;
  isStartingPrice?: boolean | null;
  city?: string | null;
  /** Fragen, die auf der Seite schon stehen (Strapi). */
  existingQuestions?: string[];
}): PurchaseFaq[] {
  const pathKey = String(input.pathKey ?? "").replace(/^\/+|\/+$/g, "");
  if (!pathKey || EXCLUDE.some((re) => re.test(pathKey))) return [];
  const where = input.city ? ` in ${input.city}` : "";
  const priceText = input.priceInEuroCent
    ? `${input.isStartingPrice === false ? "" : "ab "}${euro(input.priceInEuroCent)}`
    : null;
  const keyword = keywordCostFaq(pathKey, priceText, where);
  const key = contentKey(pathKey);
  const terms = adsV2Terms(key);
  if (!terms) return keyword ? [keyword] : [];
  const go = adsV2FaqsV2(key);
  const goBy = (q: RegExp) => go.find((f) => q.test(f.question));
  const thing = terms.treatment;
  const out: PurchaseFaq[] = [];

  if (keyword) out.push(keyword);
  else if (input.priceInEuroCent) {
    const p = priceText;
    out.push({
      topic: "cost",
      question: `Was kostet die ${thing}${where}?`,
      answer: `Bei MY HEALTH & BEAUTY kostet sie ${p}. Der Preis gilt an allen unseren Standorten; das ärztliche Beratungsgespräch und die Nachkontrolle sind inklusive.`,
    });
  }
  out.push({ topic: "included", question: "Was ist im Preis enthalten?", answer: `Das ärztliche Beratungsgespräch, die Behandlung und: ${adsV2Guarantee(key).faq}` });
  out.push({
    topic: "consult",
    question: "Ist die Beratung kostenlos?",
    answer: "Ja. Das ärztliche Beratungsgespräch ist kostenlos und unverbindlich – auch wenn du dich danach gegen eine Behandlung entscheidest.",
  });
  out.push({
    topic: "walkin",
    question: `Bekomme ich${where} auch ohne Termin eine Behandlung?`,
    answer: "Nach Verfügbarkeit ja. Vorher gibt es immer ein ärztliches Gespräch. Sicherer ist ein Termin – freie Termine siehst du bei der Online-Buchung.",
  });
  const timing = goBy(/wann|wie schnell|wie lange/i);
  if (timing) out.push({ topic: "timing", ...timing });
  const pain = goBy(/weh/i);
  if (pain) out.push({ topic: "pain", ...pain });
  const side = goBy(/nebenwirk/i);
  if (side) out.push({ topic: "side", ...side });
  const undo = goBy(/rückgängig|auflösen|nicht gefällt|reste/i);
  if (undo) out.push({ topic: "undo", ...undo });

  const existing = (input.existingQuestions ?? []).join(" \n ");
  return out.filter((f) => !TOPIC_PATTERNS[f.topic]?.test(existing));
}
