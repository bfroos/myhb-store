/**
 * Ein Klick auf „Termin buchen" = ein Buchungsversuch (elanagency/myhb-os#400).
 *
 * Meta „InitiateCheckout" haengt in GTM am `click_booking` dieser Website und
 * am `booking_start` der App. Oeffnet der Klick die App im iFrame, sind das
 * zwei Ereignisse fuer denselben Versuch. Beide tragen deshalb dieselbe
 * `event_id = checkout_<kennung>`: die Kennung entsteht hier beim Klick und
 * geht als `?checkout_id=` an die App (useAppBookingDialog, wie `fp_sid`).
 * Die App liest sie in src/lib/checkoutAttempt.ts (myhb-os).
 *
 * Die Kennung ist zufaellig und haengt an keiner Person.
 *
 * Ausserdem hier: der Preis der Behandlungsseite als Zahl, fuer Meta
 * „Schedule mit Wert". Keine Imports, damit `npm run test:unit` die Datei
 * ohne Nuxt pruefen kann.
 */

let aktuelleKennung: string | undefined;

const neueKennung = (): string => {
  try {
    return crypto.randomUUID().replace(/-/g, "");
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  }
};

/** Neuer Versuch: bei jedem Klick auf „Termin buchen". */
export function startCheckoutAttempt(): string {
  aktuelleKennung = neueKennung();
  return aktuelleKennung;
}

/** Kennung des letzten Klicks, falls es einen gab. */
export function currentCheckoutId(): string | undefined {
  return aktuelleKennung;
}

export const checkoutEventId = (id: string): string => `checkout_${id}`;

/**
 * „ab 149,99 €" → 149.99, „1.299 €" → 1299, „89€" → 89. Alles ohne Zahl oder
 * mit 0 → undefined: ein fehlender Wert ist fuer Meta ehrlicher als 0.
 *
 * Bewusst der Preis, den die Behandlungsseite zeigt (meist ein ab-Preis). Das
 * ist eine Untergrenze, kein Warenkorb; fuer die Wertoptimierung reicht eine
 * gleichbleibende Schaetzung je Behandlung.
 */
export function priceFromLabel(label: string | null | undefined): number | undefined {
  if (!label) return undefined;
  const treffer = label.match(/\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?/);
  if (!treffer) return undefined;
  // Tausenderpunkte (1.299 oder 1.299,00) weg, dann Dezimalkomma zu Punkt.
  const roh = /^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(treffer[0])
    ? treffer[0].replace(/\./g, "")
    : treffer[0];
  const wert = Number(roh.replace(",", "."));
  return Number.isFinite(wert) && wert > 0 ? Math.round(wert * 100) / 100 : undefined;
}

/**
 * Buchung nach „20 % Rabatt sichern": Die Person hat sich zuerst fuer den
 * Neukundenrabatt angemeldet. Geht als `?offer=` an die App (bewusst nicht
 * `?promo=` — das zeigt die App als „Rabattcode … sichern" an, und den echten
 * Code aus der Mail kennt die Website nicht).
 */
export const NEUKUNDEN_OFFER = "nk20";

/** Kennung einer Rabatt-Anmeldung, fuer Meta „Lead" (Browser und Server gleich). */
export const leadEventId = (): string => `lead_${neueKennung()}`;

/**
 * Wert einer Buchung mit Neukundenrabatt: 20 % weniger, auf Cent gerundet.
 * Ohne Angebot oder ohne Wert bleibt alles, wie es ist.
 */
export function offerValue(
  value: number | undefined,
  offer: string | undefined,
): number | undefined {
  if (value === undefined || offer !== NEUKUNDEN_OFFER) return value;
  return Math.round(value * 0.8 * 100) / 100;
}
