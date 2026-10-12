/**
 * E24 #318: Besuche aus KI-Assistenten erkennen (Referrer oder utm_source).
 * Grundlage fuer die GA4-Kanalgruppe "AI Assistants" und die Auswertung in
 * der App (myhb_journey speichert den Referrer-Host schon je Kontakt).
 */
const AI_SOURCES: ReadonlyArray<readonly [RegExp, string]> = [
  [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, "chatgpt"],
  [/(^|\.)perplexity\.ai$/, "perplexity"],
  [/(^|\.)copilot\.microsoft\.com$|(^|\.)bing\.com\/chat/, "copilot"],
  [/(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/, "gemini"],
  [/(^|\.)claude\.ai$/, "claude"],
  [/(^|\.)you\.com$/, "you"],
];

/** Regex fuer die GA4-Kanalgruppe (Quelle enthaelt). */
export const AI_SOURCE_REGEX = "chatgpt\\.com|openai\\.com|perplexity\\.ai|copilot\\.microsoft\\.com|gemini\\.google\\.com|claude\\.ai|you\\.com";

/** KI-Quelle aus Referrer-Host oder utm_source, sonst null. */
export function aiSource(referrerHost: string | null | undefined, utmSource?: string | null): string | null {
  const host = String(referrerHost ?? "").toLowerCase().replace(/^www\./, "");
  for (const [re, name] of AI_SOURCES) if (host && re.test(host)) return name;
  const utm = String(utmSource ?? "").toLowerCase();
  for (const [re, name] of AI_SOURCES) if (utm && re.test(utm)) return name;
  if (/^(chatgpt|perplexity|copilot|gemini|claude)$/.test(utm)) return utm;
  return null;
}
