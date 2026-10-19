/**
 * Rabatt-Fenster, Schritt 2 (myhb-app/myhb-os#1030, Benjamin 08.10.2026):
 * Nach „20 % Neukunden-Gutschein sichern" stehen die naechsten freien Termine
 * als Knoepfe im selben Fenster. Quelle: /api/naechster-termin?anzahl=3.
 */

export type FreierTermin = { date: string; time: string };

const DATUM = /^\d{4}-\d{2}-\d{2}$/;
const ZEIT = /^\d{2}:\d{2}$/;

/** Nur gueltige Eintraege, ohne Doppelte, hoechstens `max`. */
export function freieTermine(antwort: unknown, max = 3): FreierTermin[] {
  const roh = (antwort as { termine?: unknown } | null)?.termine;
  if (!Array.isArray(roh)) return [];
  const gesehen = new Set<string>();
  const out: FreierTermin[] = [];
  for (const t of roh) {
    const date = String((t as FreierTermin)?.date ?? "");
    const time = String((t as FreierTermin)?.time ?? "");
    if (!DATUM.test(date) || !ZEIT.test(time) || gesehen.has(date + time)) continue;
    gesehen.add(date + time);
    out.push({ date, time });
    if (out.length >= max) break;
  }
  return out;
}

const WOERTER: Record<string, { heute: string; morgen: string; uhr: string; locale: string }> = {
  de: { heute: "Heute", morgen: "Morgen", uhr: " Uhr", locale: "de-DE" },
  en: { heute: "Today", morgen: "Tomorrow", uhr: "", locale: "en-GB" },
  tr: { heute: "Bugün", morgen: "Yarın", uhr: "", locale: "tr-TR" },
  ar: { heute: "اليوم", morgen: "غدًا", uhr: "", locale: "ar" },
  fr: { heute: "Aujourd'hui", morgen: "Demain", uhr: "", locale: "fr-FR" },
  nl: { heute: "Vandaag", morgen: "Morgen", uhr: "", locale: "nl-NL" },
};

const berlinTag = (jetzt: number, offsetTage: number) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date(jetzt + offsetTage * 86_400_000));

/** „Heute, 14:30 Uhr" / „Morgen, 09:00 Uhr" / „Mi., 22.10., 10:15 Uhr". */
export function terminText(t: FreierTermin, sprache = "de", jetzt = Date.now()): string {
  const w = WOERTER[sprache] ?? WOERTER.de;
  const tag =
    t.date === berlinTag(jetzt, 0)
      ? w.heute
      : t.date === berlinTag(jetzt, 1)
        ? w.morgen
        : new Intl.DateTimeFormat(w.locale, { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "UTC" }).format(
            new Date(`${t.date}T12:00:00Z`),
          );
  return `${tag}, ${t.time}${w.uhr}`;
}
