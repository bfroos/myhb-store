/**
 * Zentrale Preislogik fuer Behandlungsseiten (TSEO Preise, 09.10.2026).
 *
 * Eine Quelle fuer alle Preisangaben, die das Frontend selbst erzeugt:
 * Meta Title (generiert), Hero-Preis, Buchungsdialog, Platzhalter
 * `{{ price }}` und Schema.org `Offer`. Die Daten kommen ausschliesslich aus
 * Strapi (`treatment.priceInEuroCent`, sonst `cheapestPriceInEuroCent` aus
 * den Produkt-Varianten, berechnet in myhb-cms). Es gibt KEINEN Standardpreis:
 * Fehlt ein Preis, steht nirgends einer.
 *
 * Vorher (Audit 07./09.10.2026):
 * - Meta Title der Standortseiten: `ab ${Math.floor(cent / 100)}€` und ohne
 *   Preis fest "ab 149€" (useLocationTreatmentPage.ts) - "ab 299€" statt
 *   "ab 299,99 €", bei Seiten ohne Preis ein erfundener Preis.
 * - Schema `Offer` nur aus `priceInEuroCent`, Hero aus `priceInEuroCent ||
 *   cheapestPriceInEuroCent`; das Offer erschien auch, wenn die Seite den
 *   Preis bewusst nicht zeigt (`hero.showPrice = false`, Schoenheits-OPs).
 *
 * Freitexte (Hero-Subline, FAQ, Details, gepflegte SEO-Titel) bleiben
 * redaktionell. `findPriceConflicts` macht Abweichungen sichtbar, aendert
 * aber nichts.
 *
 * Reine Funktionen ohne Nuxt-Abhaengigkeit (Unit-Tests mit node --test).
 */

export type TreatmentPriceFields = {
  priceInEuroCent?: number | string | null;
  cheapestPriceInEuroCent?: number | string | null;
  isStartingPrice?: boolean | null;
};

export type ResolvedTreatmentPrice = {
  /** Preis in Euro-Cent, immer > 0. */
  cent: number;
  /** "ab"-Preis (Strapi `isStartingPrice`). */
  isStartingPrice: boolean;
  /** Welches Strapi-Feld den Preis geliefert hat. */
  source: "priceInEuroCent" | "cheapestPriceInEuroCent";
};

function toCent(value: unknown): number | null {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  const cent = Math.round(n);
  return cent > 0 ? cent : null;
}

/**
 * Gueltiger Preis einer Behandlung oder `null`.
 * Reihenfolge wie bisher im Hero (#78): Festpreis der Behandlung vor dem
 * guenstigsten Varianten-Preis. 0, negative und ungueltige Werte gelten als
 * "kein Preis".
 */
export function resolveTreatmentPrice(
  treatment: TreatmentPriceFields | null | undefined,
): ResolvedTreatmentPrice | null {
  if (!treatment) return null;
  const own = toCent(treatment.priceInEuroCent);
  if (own) {
    return { cent: own, isStartingPrice: !!treatment.isStartingPrice, source: "priceInEuroCent" };
  }
  const cheapest = toCent(treatment.cheapestPriceInEuroCent);
  if (cheapest) {
    return { cent: cheapest, isStartingPrice: !!treatment.isStartingPrice, source: "cheapestPriceInEuroCent" };
  }
  return null;
}

/**
 * Preis, den die Seite zeigt: wie `resolveTreatmentPrice`, aber nur wenn der
 * Redaktionsschalter `hero.showPrice` an ist. Grundlage fuer Hero, Titel und
 * Schema - so zeichnet keine Stelle einen Preis aus, den die Seite verbirgt.
 */
export function visibleTreatmentPrice(
  treatment: TreatmentPriceFields | null | undefined,
  showPrice: boolean | null | undefined,
): ResolvedTreatmentPrice | null {
  if (!showPrice) return null;
  return resolveTreatmentPrice(treatment);
}

/** "299,99 €" (de-DE, immer zwei Nachkommastellen). Ohne gueltigen Preis "". */
export function formatEuroCent(cent: number | null | undefined): string {
  const value = toCent(cent);
  if (!value) return "";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

/**
 * Anzeigetext "ab 299,99 €" bzw. "299,99 €". `startingPrefix` kommt aus i18n
 * (`common.price.startingPrefix`), Deutsch "ab".
 */
export function treatmentPriceText(
  price: ResolvedTreatmentPrice | null | undefined,
  startingPrefix = "ab",
): string {
  if (!price) return "";
  const amount = formatEuroCent(price.cent);
  if (!amount) return "";
  const prefix = price.isStartingPrice ? startingPrefix.trim() : "";
  return prefix ? `${prefix} ${amount}` : amount;
}

/** Schema.org `Offer.price` ("299.99") oder `null` ohne gueltigen Preis. */
export function schemaOfferPrice(price: ResolvedTreatmentPrice | null | undefined): string | null {
  if (!price) return null;
  return (price.cent / 100).toFixed(2);
}

/**
 * Preise in einem Freitext, in Cent. Erkennt "299,99 €", "ab 299,99€",
 * "299 €", "1.499€", "ab 149" (mit "ab" auch ohne Waehrung). Jahreszahlen,
 * Prozentangaben und Mengen ("2 ml") ohne Waehrung/"ab" werden ignoriert.
 */
export function extractPriceMentions(text: string | null | undefined): number[] {
  if (!text) return [];
  const result: number[] = [];
  const re =
    /(?:\bab\s+)?(\d{1,2}\.\d{3}|\d{1,5})(?:,(\d{2}))?\s*(€|eur\b|euro\b)?/gi;
  for (const m of text.matchAll(re)) {
    const hasAb = /^ab\s/i.test(m[0]);
    if (!m[3] && !hasAb) continue;
    const euros = Number(m[1]!.replace(".", ""));
    const cents = m[2] ? Number(m[2]) : 0;
    const cent = euros * 100 + cents;
    if (cent > 0) result.push(cent);
  }
  return result;
}

export type PriceConflict = {
  field: string;
  text: string;
  mentionedCent: number;
  expectedCent: number;
  /**
   * "rundung": nur ohne Nachkommastellen ("ab 299€" bei 299,99 €).
   * "variante": Preis einer anderen Variante derselben Behandlung (z. B.
   * "1 ml ab 199,99 €" auf der Lippen-Seite) - kein Fehler, nur Hinweis.
   */
  kind: "abweichung" | "rundung" | "variante";
};

/**
 * Vergleicht Preise in Freitexten mit dem gueltigen Preis. Liefert jede
 * abweichende Erwaehnung; mehrere Preise in einem Text (z. B. Zonen-Liste im
 * FAQ) werden einzeln gemeldet - ob das ein Konflikt ist, entscheidet die
 * Redaktion.
 */
export function findPriceConflicts(
  expected: ResolvedTreatmentPrice | null | undefined,
  texts: Record<string, string | null | undefined>,
  /** Weitere gueltige Preise der Behandlung (aktive Produkt-Varianten). */
  variantCents: number[] = [],
): PriceConflict[] {
  if (!expected) return [];
  const conflicts: PriceConflict[] = [];
  for (const [field, text] of Object.entries(texts)) {
    for (const cent of extractPriceMentions(text)) {
      if (cent === expected.cent) continue;
      const kind = variantCents.includes(cent)
        ? "variante"
        : cent % 100 === 0 && Math.floor(expected.cent / 100) * 100 === cent
          ? "rundung"
          : "abweichung";
      conflicts.push({ field, text: text ?? "", mentionedCent: cent, expectedCent: expected.cent, kind });
    }
  }
  return conflicts;
}
