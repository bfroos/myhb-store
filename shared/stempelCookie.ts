/**
 * myhb-os#2157: Der Werbe-Stempel `myhb_attribution` wird im Browser per
 * JavaScript gesetzt (app/plugins/utm-persist.client.ts). Safari und alle
 * iPhone-Browser kappen solche Cookies auf 7 Tage (ITP), obwohl 90 Tage
 * gesetzt sind. Gemessen 05.11.2026: 95 % der Buchungen kommen bis 35 Tage
 * nach dem ersten Kontakt, 99 % bis 60 Tage; wer nach Tag 7 auf dem iPhone
 * bucht, hatte keinen Stempel mehr.
 *
 * Von der eigenen Domain per Set-Cookie gesetzte Cookies kappt ITP nicht auf
 * 7 Tage. Deshalb schickt der Browser den Stempel nach jedem Speichern an
 * /api/stempel, und der Server setzt ihn mit derselben Laufzeit noch einmal.
 */
export const STEMPEL_KEY = "myhb_attribution";
export const STEMPEL_TAGE = 90;
/** Mehr als ein Stempel je wird es nie; schuetzt vor uebergrossen Headern. */
export const STEMPEL_MAX_LAENGE = 3000;
const EIGENE_DOMAIN = "myhealthandbeauty.com";

/** Nimmt nur, was wie ein Stempel aussieht: JSON mit first oder last. */
export function stempelGueltig(roh: string | undefined | null): string | null {
  if (!roh || roh.length > STEMPEL_MAX_LAENGE) return null;
  try {
    const s = JSON.parse(roh);
    if (!s || typeof s !== "object" || Array.isArray(s)) return null;
    if (!("first" in s) && !("last" in s)) return null;
    return roh;
  } catch {
    return null;
  }
}

/**
 * Domain fuer Set-Cookie: auf myhealthandbeauty.com die ganze Domain (die App
 * auf app.myhealthandbeauty.com liest mit), sonst (Vercel-Vorschau, localhost)
 * ohne Domain-Angabe, damit der Browser das Cookie nicht verwirft.
 */
export function stempelDomain(host: string | undefined | null): string | undefined {
  const h = String(host || "").toLowerCase().split(":")[0];
  return h === EIGENE_DOMAIN || h.endsWith("." + EIGENE_DOMAIN) ? "." + EIGENE_DOMAIN : undefined;
}
