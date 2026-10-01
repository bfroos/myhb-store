/**
 * go.* Angebots-Test (shared/adsOfferVariant.ts): `offer_variant` fuer die
 * Datenschicht. Auf v2-Seiten aus dem Pfad ("b" unter /ab-beratung/...,
 * sonst "a"); auf anderen Seiten derselben Sitzung (Dankesseite nach
 * Calendly, Standortseite) der zuletzt gesehene Wert. Ohne v2-Besuch: kein
 * Wert. Nur im Browser.
 *
 * Bewusst nicht `ab_variant`: das belegt der Calendly-/App-Split (#100).
 */
import { isAdsOfferBPath, type AdsOfferVariant } from "#shared/adsOfferVariant";

const KEY = "myhb_offer_variant";
let remembered: AdsOfferVariant | null = null;

export function rememberOfferVariant(v: AdsOfferVariant): void {
  remembered = v;
  try {
    sessionStorage.setItem(KEY, v);
  } catch {}
}

export function currentOfferVariant(): AdsOfferVariant | undefined {
  if (typeof window === "undefined") return undefined;
  if (isAdsOfferBPath(window.location.pathname)) return "b";
  if ((window as any).__myhbPreviewTemplate === "v2") return "a";
  if (remembered) return remembered;
  try {
    const v = sessionStorage.getItem(KEY);
    if (v === "a" || v === "b") return v;
  } catch {}
  return undefined;
}

/** Ereignisse, die den Wert tragen (keine neuen Ereignisnamen). */
export function carriesOfferVariant(eventName: string): boolean {
  return (
    eventName === "click_booking" ||
    eventName === "click_phone" ||
    eventName === "click_voucher" ||
    eventName === "newsletter_signup" ||
    eventName.startsWith("booking_")
  );
}
