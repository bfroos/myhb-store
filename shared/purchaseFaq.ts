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
  const key = contentKey(pathKey);
  const terms = adsV2Terms(key);
  if (!terms) return [];
  const go = adsV2FaqsV2(key);
  const goBy = (q: RegExp) => go.find((f) => q.test(f.question));
  const where = input.city ? ` in ${input.city}` : "";
  const thing = terms.treatment;
  const out: PurchaseFaq[] = [];

  if (input.priceInEuroCent) {
    const p = `${input.isStartingPrice === false ? "" : "ab "}${euro(input.priceInEuroCent)}`;
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
