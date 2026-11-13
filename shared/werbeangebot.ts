/**
 * Werbeangebot mit Guthaben an die App weitergeben (myhb-app/myhb-os#2188, 13.11.2026).
 *
 * Eine Anzeige zeigt auf die Website mit `?angebot=<wert>` (z. B.
 * `?angebot=zone100`). Bucht der Kunde hier, geht der Wert als `angebot=` an
 * die App-Buchung. Die App merkt ihn sich, und die Datenbank bucht das Guthaben
 * (Tabelle werbeangebote; Betrag, Status und Laufzeit stehen nur dort).
 *
 * Hier wird nur die Form geprueft, dieselbe Regel wie in der App
 * (myhb-os src/lib/startguthabenLink.ts): Kleinbuchstaben, Ziffern, Bindestrich,
 * 2–40 Zeichen. Ein unbekannter oder nicht freigeschalteter Wert bucht in der
 * App nichts, er schadet also nicht.
 */
const ANGEBOT = /^[a-z0-9][a-z0-9-]{1,39}$/;

export function normalAngebot(wert: string | null | undefined): string | null {
  if (!wert) return null;
  const w = wert.trim().toLowerCase();
  return ANGEBOT.test(w) ? w : null;
}

/** Liest `?angebot=` aus einem Query-String oder einer URL. */
export function angebotAusSuche(suche: string): string | null {
  try {
    const params = suche.includes("://")
      ? new URL(suche).searchParams
      : new URLSearchParams(suche);
    return normalAngebot(params.get("angebot"));
  } catch {
    return null;
  }
}

/**
 * Haengt `angebot=` an eine Buchungs-URL. Ein Wert, der schon an der URL steht,
 * bleibt (wie bei allen anderen Parametern in buildBookingUrl).
 */
export function mitAngebot(url: string, angebot: string | null | undefined): string {
  const a = normalAngebot(angebot);
  if (!a) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.has("angebot")) u.searchParams.set("angebot", a);
    return u.toString();
  } catch {
    return url;
  }
}
