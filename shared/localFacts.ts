/**
 * E24 #312: Standortfakten aus Strapi (`location.localFacts`, myhb-cms#50)
 * fuer die Stadtseiten. Was in Strapi gepflegt ist, gewinnt; leere Felder
 * fallen auf den Text im Code (shared/seoPilotLippen.ts) zurueck. So kann
 * jeder Standort in Strapi gepflegt werden, ohne dass eine halb gepflegte
 * Seite Luecken zeigt.
 *
 * Mehrzeilige Felder (wayInCenter, parking, serviceArea): eine Zeile je
 * Punkt. serviceArea darf auch kommagetrennt sein, solange kein Ort selbst
 * ein Komma enthaelt.
 */
import type { SeoCityContent } from "./seoPilotLippen.ts";

export type LocalFactsDto = {
  district?: string | null;
  placeInCenter?: string | null;
  wayInCenter?: string | null;
  parking?: string | null;
  accessibility?: string | null;
  serviceAreaText?: string | null;
  serviceArea?: string | null;
  languages?: string | null;
  factsSource?: string | null;
  /** ISO-Datum, z. B. "2026-10-12". */
  checkedAt?: string | null;
};

const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

function text(v: string | null | undefined): string | null {
  const s = String(v ?? "").trim();
  return s ? s : null;
}

function lines(v: string | null | undefined): string[] | null {
  const s = text(v);
  if (!s) return null;
  const parts = s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  return parts.length ? parts : null;
}

function list(v: string | null | undefined): string[] | null {
  const s = text(v);
  if (!s) return null;
  const parts = (/\n/.test(s) ? s.split(/\r?\n/) : s.split(","))
    .map((x) => x.trim())
    .filter(Boolean);
  return parts.length ? parts : null;
}

/** "Deutsch, Englisch, Arabisch" -> "Im Team sprechen wir Deutsch, Englisch und Arabisch." */
export function languagesSentence(v: string | null | undefined): string | null {
  const l = list(v);
  if (!l) return null;
  const joined = l.length === 1 ? l[0] : `${l.slice(0, -1).join(", ")} und ${l[l.length - 1]}`;
  return `Im Team sprechen wir ${joined}.`;
}

/** Quelle + Stand: "Parken und Linien laut Köln Arcaden, Stand Oktober 2026. Angaben ohne Gewähr." */
export function factsSourceSentence(
  source: string | null | undefined,
  checkedAt: string | null | undefined,
): string | null {
  const s = text(source);
  if (!s) return null;
  if (/[.!]$/.test(s)) return s;
  const m = /^(\d{4})-(\d{2})/.exec(String(checkedAt ?? ""));
  const month = m ? MONTHS[Number(m[2]) - 1] : null;
  const stand = m && month ? `, Stand ${month} ${m[1]}` : "";
  return `${s}${stand}. Angaben ohne Gewähr.`;
}

/** Stadtseite mit den Strapi-Fakten des Standorts; ohne Fakten unveraendert. */
export function applyLocalFacts(
  content: SeoCityContent,
  facts: LocalFactsDto | null | undefined,
): SeoCityContent {
  if (!facts) return content;
  return {
    ...content,
    district: text(facts.district) ?? content.district,
    whereHeadline: text(facts.placeInCenter) ?? content.whereHeadline,
    whereSteps: lines(facts.wayInCenter) ?? content.whereSteps,
    parking: lines(facts.parking) ?? content.parking,
    accessibility: text(facts.accessibility) ?? content.accessibility,
    serviceAreaText: text(facts.serviceAreaText) ?? content.serviceAreaText,
    serviceArea: list(facts.serviceArea) ?? content.serviceArea,
    languages: languagesSentence(facts.languages) ?? content.languages,
    factsSource: factsSourceSentence(facts.factsSource, facts.checkedAt) ?? content.factsSource,
  };
}
