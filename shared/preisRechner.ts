/**
 * Preisrechner fuer OP-Landingpages (E28, myhb-app/myhb-os#1639).
 * Alle Zahlen kommen aus Strapi (blocks.price-calculator); hier steht nur die
 * Rechnung, damit sie ohne Browser testbar ist.
 */

export type RechnerBereich = { label: string; grafts: number };
export type RechnerMethode = { label: string; pricePerGraftCent: number; hint?: string | null };
export type RechnerZusatz = { label: string; priceCent: number };

/** Vorschlag aus den gewaehlten Bereichen, auf Raster und Grenzen gebracht. */
export function vorschlagEinheiten(
  bereiche: RechnerBereich[],
  grenzen: { min: number; max: number; step: number; standard: number },
): number {
  const summe = bereiche.reduce((s, b) => s + (b.grafts || 0), 0);
  const roh = summe > 0 ? summe : grenzen.standard;
  return begrenze(roh, grenzen);
}

export function begrenze(
  wert: number,
  grenzen: { min: number; max: number; step: number },
): number {
  const step = grenzen.step > 0 ? grenzen.step : 1;
  const gerastert = Math.round(wert / step) * step;
  return Math.min(grenzen.max, Math.max(grenzen.min, gerastert));
}

/**
 * Einheiten x Preis je Graft, mindestens der Mindestpreis (Michaels Entwurf:
 * 2.900 €), dazu die Zusaetze.
 */
export function preisCent(
  einheiten: number,
  methode: RechnerMethode | null | undefined,
  zusaetze: RechnerZusatz[] = [],
  mindestCent = 0,
): number {
  const roh = methode ? Math.round(einheiten * methode.pricePerGraftCent) : 0;
  const basis = methode ? Math.max(mindestCent || 0, roh) : 0;
  return basis + zusaetze.reduce((s, z) => s + (z.priceCent || 0), 0);
}

/** "6,12,24,36" → [6, 12, 24, 36] */
export function laufzeiten(text: string | null | undefined): number[] {
  return (text ?? "")
    .split(/[,;\s]+/)
    .map((t) => Number.parseInt(t, 10))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= 120);
}

/** Monatsrate ohne Zinsen, auf volle Euro aufgerundet (in Cent). */
export function monatsrateCent(gesamtCent: number, anzahlungCent: number, monate: number): number {
  if (monate <= 0) return 0;
  const rest = Math.max(0, gesamtCent - Math.max(0, anzahlungCent));
  return Math.ceil(rest / monate / 100) * 100;
}

export function formatEuro(cent: number): string {
  const euro = cent / 100;
  return `${euro.toLocaleString("de-DE", {
    minimumFractionDigits: Number.isInteger(euro) ? 0 : 2,
    maximumFractionDigits: 2,
  })} €`;
}
