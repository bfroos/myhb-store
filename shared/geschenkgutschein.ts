/**
 * Geschenkgutschein auf der Website (myhb-os, Umzug vom alten Onlineshop,
 * 22.10.2026).
 *
 * Verkauft wird weiter das Shopify-Gutscheinprodukt "MY HEALTH & BEAUTY
 * Geschenkgutschein" (gid://shopify/Product/8044165333272). Damit bleibt der
 * Gutschein ein echter Shopify-Gutschein: Die Kundin bekommt Code und Mail von
 * Shopify, die Kasse (POS) loest ihn ein wie bisher, Klarna und PayPal laufen
 * ueber den Shopify-Checkout.
 *
 * Statt der Produktseite im alten Shop fuehrt die Website ueber einen
 * Cart-Permalink (/cart/<variante>:<menge>) direkt in den Checkout. Der braucht
 * kein Storefront-Token und funktioniert, solange das Produkt im Kanal
 * "Onlineshop" veroeffentlicht und der Shop NICHT passwortgeschuetzt ist —
 * ein Passwort sperrt auch den Checkout.
 *
 * Die Varianten-IDs sind fest eingetragen. Aendert jemand in Shopify die
 * Betraege, muss diese Liste mit (Abfrage: product(id: …) { variants }).
 */

export const GUTSCHEIN_CHECKOUT_HOST = "https://shop.myhealthandbeauty.com";
export const GUTSCHEIN_PATH = "/gutschein";

export type GutscheinBetrag = { euro: number; variantId: string };

export const GUTSCHEIN_BETRAEGE: readonly GutscheinBetrag[] = [
  { euro: 5, variantId: "49641453846875" },
  { euro: 10, variantId: "44148335739160" },
  { euro: 20, variantId: "48865401700699" },
  { euro: 25, variantId: "44148335771928" },
  { euro: 50, variantId: "44148335804696" },
  { euro: 100, variantId: "44148335837464" },
  { euro: 150, variantId: "51951321874779" },
  { euro: 200, variantId: "44148335870232" },
  { euro: 300, variantId: "48865415233883" },
  { euro: 500, variantId: "44148335903000" },
];

export const GUTSCHEIN_STANDARD_EURO = 100;
export const GUTSCHEIN_MAX_MENGE = 10;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/**
 * Checkout-Link fuer einen Betrag. Kampagnenwerte der Seite gehen mit, damit
 * Shopify die Bestellung der Quelle zuordnet; das Bestellattribut "quelle"
 * trennt Website-Kaeufe von Altlinks auf den Shop.
 */
export function gutscheinCheckoutUrl(
  euro: number,
  menge = 1,
  query: Record<string, unknown> = {},
): string | null {
  const betrag = GUTSCHEIN_BETRAEGE.find((b) => b.euro === euro);
  if (!betrag) return null;
  const anzahl = Math.min(GUTSCHEIN_MAX_MENGE, Math.max(1, Math.floor(menge) || 1));
  const params = new URLSearchParams();
  for (const key of UTM_KEYS) {
    const v = query[key];
    const s = Array.isArray(v) ? v[0] : v;
    if (typeof s === "string" && s.trim()) {
      const wert = s.trim().slice(0, 100);
      params.set(key, wert);
      // Shopify speichert die UTM eines Cart-Permalinks nicht in der
      // Customer Journey (26.11.2026: 12 von 13 Black-Friday-Gutscheinen ohne
      // Herkunft). Als Bestellattribut bleibt sie an der Bestellung haengen.
      params.set(`attributes[${key}]`, wert);
    }
  }
  params.set("attributes[quelle]", "website-gutschein");
  return `${GUTSCHEIN_CHECKOUT_HOST}/cart/${betrag.variantId}:${anzahl}?${params.toString()}`;
}

/** Alte Gutschein-Adressen im Shop, die Strapi oder Altlinks noch tragen. */
const ALTER_SHOP_GUTSCHEIN =
  /^https?:\/\/(shop\.myhealthandbeauty\.com|my-hb\.myshopify\.com)\/products\/(myh-b-geschenkgutschein|my-geschenkgutschein)\/?(\?.*)?$/i;

/**
 * Biegt einen Link auf den Gutschein im alten Shop auf die Website-Seite um.
 * Andere Links bleiben unveraendert. Query-Werte des Altlinks (utm_*) gehen mit.
 */
export function gutscheinLink(url: string | null | undefined): string | null {
  if (!url) return url ?? null;
  const m = url.trim().match(ALTER_SHOP_GUTSCHEIN);
  if (!m) return url;
  return m[3] ? `${GUTSCHEIN_PATH}${m[3]}` : GUTSCHEIN_PATH;
}

export function euroText(euro: number): string {
  return `${euro} €`;
}

/**
 * Black Friday 2026 (Michael, 26.11.2026): Online-Gutscheine 10 % guenstiger.
 * Den Abzug macht Shopify selbst mit dem automatischen Rabatt
 * "Black Friday 27.11.2026 – Gutschein online 10 %"
 * (gid://shopify/DiscountAutomaticNode/1958470713691). Fenster und Satz hier
 * muessen zu diesem Rabatt passen, sonst zeigt die Seite einen anderen Preis
 * als der Checkout.
 */
export const GUTSCHEIN_AKTION = {
  name: "Black Friday",
  prozent: 10,
  start: Date.parse("2026-11-26T19:00:00Z"),
  ende: Date.parse("2026-11-27T22:59:59Z"),
} as const;

/** Rabatt in Prozent, der gerade im Checkout abgezogen wird, sonst 0. */
export function gutscheinAktionProzent(jetzt = Date.now()): number {
  return jetzt >= GUTSCHEIN_AKTION.start && jetzt <= GUTSCHEIN_AKTION.ende ? GUTSCHEIN_AKTION.prozent : 0;
}

/** Preis nach Rabatt in Cent, kaufmaennisch gerundet wie Shopify. */
export function gutscheinPreisCent(euro: number, prozent: number): number {
  return Math.round(euro * 100 * (1 - prozent / 100));
}

/** 90 € / 4,50 € */
export function centText(cent: number): string {
  return cent % 100 === 0 ? `${cent / 100} €` : `${(cent / 100).toFixed(2).replace(".", ",")} €`;
}
