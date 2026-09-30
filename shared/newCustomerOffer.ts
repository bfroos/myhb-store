/**
 * Neukundenpreis fuer go.* (Ads-Modus).
 *
 * Google-Anzeigen werben mit dem Preis nach 20 % Neukundenrabatt (Newsletter-
 * Anmeldung). Die Zielseite muss denselben Preis zeigen, sonst passt die
 * Anzeige nicht zur Seite. Der regulaere Preis bleibt sichtbar; im Shop und in
 * Strapi aendert sich nichts, der Rabatt wird wie bisher an der Kasse
 * abgezogen.
 *
 * Regel (Benjamin, 29.09.2026): Preis x (1 - Rabatt), dann auf ",99"
 * abrunden. Bei allen ",99"-Preisen weicht das 0,2 Cent vom exakten
 * Rabattpreis ab, immer zu Gunsten der Kundin. Weicht die Rundung mehr als
 * MAX_ROUNDING_CENT ab (Preise auf ",00", z. B. die Schoenheits-OPs), wird
 * kein Neukundenpreis gezeigt statt eines, der 21 Cent daneben liegt.
 *
 * Sonderfall Muskelrelaxans ab 149,99 € (1 Zone): Beworben wird der Preis je
 * Zone ab zwei Zonen, 2 Zonen 199,99 € - 20 % = 159,99 € = 79,995 € je Zone,
 * angezeigt 79,99 €.
 */

export const DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT = 20;

/** Groesste zulaessige Rundungsabweichung nach unten, in Cent. */
export const MAX_ROUNDING_CENT = 5;

/**
 * Muskelrelaxans-Seiten mit eigener Preisstruktur (Festpreis je Behandlung,
 * nicht je Zone). Migraene kostet zwar ab 149,99 €, ist aber eine
 * Therapie und wird bewusst nicht mit "pro Zone" beworben.
 */
const ZONE_OFFER_EXCLUDED =
  /(?:^|\/)(?:masseter|zaehneknirschen-bruxismus|hyperhidrose-starkes-schwitzen|migraenebehandlung)(?:-rabatt)?$/;

/** 1 Zone Muskelrelaxans; nur Seiten mit diesem ab-Preis bekommen das Zonenangebot. */
export const ONE_ZONE_PRICE_CENT = 14999;

/**
 * 2 Zonen Muskelrelaxans, Stand 29.09.2026 an allen 10 Centern (Strapi-
 * Variante "2-zonen" bzw. Preistabelle im Seitentext). Gilt nur, wenn die
 * Seite selbst keine Variante "2-zonen" mitbringt (Grundseite, Zornesfalte).
 */
export const TWO_ZONE_PRICE_CENT_FALLBACK = 19999;

export type NewCustomerOffer = {
  kind: "zone" | "price";
  /** Regulaerer Preis, z. B. "Regulär ab 149,99 € (1 Zone)". */
  regular: string;
  /** Hauptzeile mit Sternchen, z. B. "Neukunden: ab 79,99 € pro Zone*". */
  headline: string;
  /**
   * Kurze Preiszeile fuer den ersten Screen und die mitlaufende Leiste
   * (Benjamin, 30.09.2026: im Hero nur EINE Preiszeile, keine Rechnung):
   * "ab 79,99 € pro Zone*" bzw. "Neukunden ab 119,99 €*".
   */
  heroLine: string;
  /** Rechenweg, nur beim Zonenangebot. */
  calculation?: string;
  /** Fussnote mit Sternchen. */
  footnote: string;
  /** Zonenangebot: Fussnote fuer die uebrigen *-Preise der Seite. */
  footnote2?: string;
  /**
   * Eine kompakte Fussnotenzeile fuers Seitenende: erklaert das Sternchen
   * und nennt den regulaeren Preis (der im Hero nicht mehr steht).
   */
  pageFootnote: string;
  /** Angezeigter Neukundenpreis in Cent (je Zone beim Zonenangebot). */
  priceCent: number;
};

export type NewCustomerOfferInput = {
  pathKey?: string | null;
  /** priceInEuroCent || cheapestPriceInEuroCent der Behandlung. */
  priceCent?: number | null;
  isStartingPrice?: boolean | null;
  /** Preis der Variante "2-zonen", falls die Seite eine hat. */
  twoZonePriceCent?: number | null;
  discountPct?: number | null;
};

/** Exakter Rabattpreis in Cent (ungerundet). */
export function discountedExactCent(cent: number, pct: number): number {
  return (cent * (100 - pct)) / 100;
}

/**
 * Preis x (1 - pct), auf ",99" abgerundet. `null`, wenn der Preis fehlt oder
 * die Rundung mehr als MAX_ROUNDING_CENT unter dem exakten Wert laege.
 */
export function newCustomerPriceCent(
  cent: number | null | undefined,
  pct: number = DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT,
): number | null {
  if (!cent || cent <= 0 || !(pct > 0 && pct < 100)) return null;
  const exact = discountedExactCent(cent, pct);
  const rounded = Math.floor((exact - 99) / 100) * 100 + 99;
  if (rounded <= 0) return null;
  if (exact - rounded > MAX_ROUNDING_CENT) return null;
  return rounded;
}

export function formatEuroCent(cent: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(cent / 100)
    .replace(/ /g, " ");
}

export function isZoneOfferPath(pathKey: string | null | undefined): boolean {
  if (!pathKey) return false;
  if (pathKey !== "muskelrelaxans" && !pathKey.startsWith("muskelrelaxans/"))
    return false;
  return !ZONE_OFFER_EXCLUDED.test(pathKey);
}

export function buildNewCustomerOffer(
  input: NewCustomerOfferInput,
): NewCustomerOffer | null {
  const pct = input.discountPct || DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT;
  const cent = input.priceCent;
  if (!cent || cent <= 0) return null;
  if (isSurgeryPathKey(input.pathKey)) return null;
  const ab = input.isStartingPrice ? "ab " : "";

  if (isZoneOfferPath(input.pathKey) && cent === ONE_ZONE_PRICE_CENT) {
    const twoZones = input.twoZonePriceCent || TWO_ZONE_PRICE_CENT_FALLBACK;
    // Die Kasse rundet den Rabattbetrag auf ganze Cent (159,992 -> 159,99).
    const twoZonesDiscounted = Math.round(discountedExactCent(twoZones, pct));
    const perZoneExact = twoZonesDiscounted / 2;
    const perZone = Math.floor((perZoneExact - 99) / 100) * 100 + 99;
    if (perZone > 0 && perZoneExact - perZone <= MAX_ROUNDING_CENT) {
      const perZoneLabel = formatEuroCent(perZone);
      // Keine "genau 79,995 €"-Rechnung mehr (Benjamin, 30.09.2026): Die
      // Kasse rechnet 159,99 € fuer zwei Zonen, je Zone steht der
      // abgerundete Wert.
      const regular = `regulär ${ab}${formatEuroCent(cent)} (1 Zone)`;
      return {
        kind: "zone",
        regular,
        headline: `Neukunden: ab ${perZoneLabel} pro Zone*`,
        heroLine: `ab ${perZoneLabel} pro Zone*`,
        calculation: `2 Zonen ${formatEuroCent(twoZones)} − ${pct} % Neukundenrabatt = ${formatEuroCent(twoZonesDiscounted)} (${perZoneLabel} je Zone)`,
        footnote: `*Gilt ab zwei Zonen Muskelrelaxans in Kombination mit dem ${pct}-%-Neukundenrabatt.`,
        footnote2: `Alle anderen mit * markierten Preise auf dieser Seite ${newCustomerFootnote(pct).slice(1)}.`,
        pageFootnote: `*Neukundenpreise inkl. ${pct} % Neukundenrabatt. „ab ${perZoneLabel} pro Zone“ gilt ab zwei Zonen (2 Zonen ${formatEuroCent(twoZonesDiscounted)} statt ${formatEuroCent(twoZones)}), ${regular}.`,
        priceCent: perZone,
      };
    }
  }

  const nk = newCustomerPriceCent(cent, pct);
  if (!nk) return null;
  const regular = `regulär ${ab}${formatEuroCent(cent)}`;
  return {
    kind: "price",
    regular,
    headline: `Neukunden ${ab}${formatEuroCent(nk)}*`,
    heroLine: `Neukunden ${ab}${formatEuroCent(nk)}*`,
    footnote: newCustomerFootnote(pct),
    pageFootnote: `*Neukundenpreise inkl. ${pct} % Neukundenrabatt, ${regular}.`,
    priceCent: nk,
  };
}

export function newCustomerFootnote(
  pct: number = DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT,
): string {
  return `*inkl. ${pct} % Neukundenrabatt`;
}

/**
 * "ab 119,99 €*" fuer einen regulaeren Preis in Cent, oder `null`, wenn die
 * Rundungsregel nicht passt (dann bleibt der regulaere Preis stehen).
 */
export function newCustomerPriceLabel(
  cent: number | null | undefined,
  prefix?: string | null,
  pct: number = DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT,
): string | null {
  const nk = newCustomerPriceCent(cent, pct);
  if (!nk) return null;
  const p = (prefix ?? "").trim();
  return `${p ? `${p} ` : ""}${formatEuroCent(nk)}*`;
}

// "149,99 €", "149,99€", "1.499,00 €", "ab 149€". Nicht: "0,5 ml", bereits
// umgestellte Preise ("119,99 €*"), Ziffern mitten in anderen Zahlen.
const TEXT_PRICE =
  /(?<![\d.,])(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{2}))?([  ]?)€(?!\*)/g;

/**
 * Stellt Preise im Fliesstext auf den Neukundenpreis um ("ab 149,99 €" ->
 * "ab 119,99 €*"). Ganze Euro ("ab 149€") stehen in den Texten fuer den
 * ",99"-Preis und werden nur umgestellt, wenn sie auf 9 enden; alles andere
 * bleibt, wie es ist.
 */
export function applyNewCustomerPricesToText(
  value: string,
  pct: number = DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT,
): string {
  if (!value.includes("€")) return value;
  return value.replace(TEXT_PRICE, (match, whole: string, cents?: string) => {
    const euros = Number(whole.replace(/\./g, ""));
    if (!Number.isFinite(euros)) return match;
    let cent: number;
    if (cents !== undefined) cent = euros * 100 + Number(cents);
    else if (euros % 10 === 9) cent = euros * 100 + 99;
    else return match;
    const nk = newCustomerPriceCent(cent, pct);
    return nk ? `${formatEuroCent(nk)}*` : match;
  });
}

const PRICE_SKIP_KEY =
  /(?:url|href|slug|slugs|pathkey)$|^(?:id|documentid|hash|ext|mime|provider|key|locale)$/i;

/**
 * applyNewCustomerPricesToText rekursiv ueber eine Strapi-Antwort.
 * Teilbaeume von Schoenheits-OPs bleiben unberuehrt: Deren Preise enden auf
 * ",00" (die ",99"-Regel laege 21 Cent daneben), und ob der Neukundenrabatt
 * fuer OPs gilt, ist nicht geklaert.
 */
export function applyNewCustomerPricesDeep<T>(
  input: T,
  pct: number = DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT,
): T {
  const walk = (value: any, key?: string): any => {
    if (typeof value === "string") {
      if (key && PRICE_SKIP_KEY.test(key)) return value;
      return applyNewCustomerPricesToText(value, pct);
    }
    if (Array.isArray(value)) return value.map((item) => walk(item, key));
    if (value !== null && typeof value === "object") {
      if (isSurgeryPathKey(value.pathKey)) return value;
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) out[k] = walk(v, k);
      return out;
    }
    return value;
  };
  return walk(input);
}

export function isSurgeryPathKey(pathKey: unknown): boolean {
  return (
    typeof pathKey === "string" && pathKey.startsWith("schoenheitsoperationen")
  );
}
