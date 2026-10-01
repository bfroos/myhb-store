/**
 * go.* Vorlage v2: A/B-Test des Angebots (vorbereitet 01.10.2026, NICHT
 * aktiv, solange keine Anzeige den Parameter nutzt).
 *
 * - Variante A (Standard, ohne Parameter): heutige Seite mit
 *   Neukundenrabatt, Neukundenpreisen mit Sternchen, "20 % Rabatt sichern".
 * - Variante B (`?angebot=beratung`): "Kostenlose Beratung buchen", keine
 *   Rabattbotschaft, regulaere Preise aus Strapi (priceInEuroCent, dieselbe
 *   Quelle wie www), Fokus auf Vertrauen.
 *
 * Mechanik: Vercel-ISR reicht die Query nicht an das Server-Rendern durch
 * (siehe ADS_TEMPLATE_V2_PREVIEW_PREFIX), die echte Seite kaeme fuer
 * `?angebot=beratung` als Variante A aus dem Cache. Variante B hat deshalb
 * einen eigenen Pfad /ab-beratung/standorte/... - serverseitig gerendert und
 * eigens gecacht, kein Flackern. Die echte Seite leitet `?angebot=beratung`
 * mit einem Skript im <head> vor dem ersten Zeichnen dorthin um (Query und
 * gclid bleiben dran); Navigation in der App per Middleware.
 *
 * Zuordnung der Buchung: Der Pfad /ab-beratung/... reist schon heute mit -
 * Calendly ueber salesforce_uuid ";lp:<pfad>" (utm-persist v1.6, T14 ->
 * appointment_attribution.ref_path), die App ueber `ref_path`. Ereignisse
 * tragen zusaetzlich `offer_variant` = "a" | "b" (NICHT `ab_variant`: das
 * ist der Calendly-/App-Split #100 mit "app"/"calendly").
 */

/** Notschalter: false = keine Umleitung, /ab-beratung/... fuehrt zur echten Seite. */
export const ADS_OFFER_AB_ENABLED = true;

export const ADS_OFFER_QUERY_KEY = "angebot";
export const ADS_OFFER_QUERY_B = "beratung";
export const ADS_OFFER_B_PREFIX = "/ab-beratung";

export type AdsOfferVariant = "a" | "b";

export function isAdsOfferBPath(path: string | null | undefined): boolean {
  return /^\/ab-beratung\/standorte\//.test(String(path ?? ""));
}

/** /ab-beratung/standorte/... -> /standorte/... (Canonical, Notschalter). */
export function stripAdsOfferB(path: string): string {
  return path.replace(/^\/ab-beratung(?=\/standorte\/)/, "");
}

/** /standorte/... -> /ab-beratung/standorte/... */
export function adsOfferBPath(path: string): string {
  return isAdsOfferBPath(path) ? path : `${ADS_OFFER_B_PREFIX}${path}`;
}

export function wantsAdsOfferB(query: Record<string, unknown> | URLSearchParams | null | undefined): boolean {
  if (!query) return false;
  const v = query instanceof URLSearchParams ? query.get(ADS_OFFER_QUERY_KEY) : query[ADS_OFFER_QUERY_KEY];
  return (Array.isArray(v) ? v[0] : v) === ADS_OFFER_QUERY_B;
}

/**
 * Skript fuer den <head> der echten v2-Seite: `?angebot=beratung` ->
 * /ab-beratung/... vor dem ersten Zeichnen (location.replace, kein
 * Verlaufseintrag). Ohne den Parameter tut es nichts.
 */
export const ADS_OFFER_REDIRECT_SCRIPT = `(function(){try{var q=new URLSearchParams(location.search);if(q.get(${JSON.stringify(
  ADS_OFFER_QUERY_KEY,
)})===${JSON.stringify(ADS_OFFER_QUERY_B)}&&/^\\/standorte\\//.test(location.pathname)){location.replace(${JSON.stringify(
  ADS_OFFER_B_PREFIX,
)}+location.pathname+location.search+location.hash)}}catch(e){}})();`;

/**
 * Variante B: regulaerer Preis statt Neukundenpreis, z. B. "ab 149,99 €".
 * Aus priceInEuroCent || cheapestPriceInEuroCent wie www
 * (app/utils/treatmentPriceLabel.ts), nicht aus dem Rabattpreis
 * zurueckgerechnet.
 */
export function adsOfferRegularPriceLine(
  treatment: { priceInEuroCent?: number | null; cheapestPriceInEuroCent?: number | null; isStartingPrice?: boolean | null } | null | undefined,
  format: (cent: number) => string,
): string | null {
  const cent = treatment?.priceInEuroCent || treatment?.cheapestPriceInEuroCent;
  if (!cent || cent <= 0) return null;
  return `${treatment?.isStartingPrice ? "ab " : ""}${format(cent)}`;
}

/** Preiskarten der Variante B: regulaerer Preis gross, kein Sternchen, keine Rechnung je Zone. */
export function adsOfferRegularCards<T extends { regular: string; offer: string | null; note?: string; isPackage?: boolean }>(
  cards: T[],
): T[] {
  return cards
    .filter((c) => !c.isPackage)
    .map((c) => ({
      ...c,
      offer: c.regular.replace(/^regulär\s+/, ""),
      regular: "",
      note: undefined,
    }));
}

/**
 * SEO-Texte aus Strapi tragen auf go. den Neukundenpreis ("ab 119,99 €*",
 * server/api/strapi). In Variante B steht dort der regulaere Preis.
 */
export function adsOfferRegularText(text: string, regularLabel: string | null): string {
  const starred = /(?:ab\s)?\d{1,3}(?:\.\d{3})*,\d{2}[\s\u00a0]?€(?:\s+pro\s+Zone)?\*/g;
  if (!regularLabel) return text.replace(starred, (m) => m.replace(/\*$/, ""));
  return text.replace(starred, regularLabel);
}
