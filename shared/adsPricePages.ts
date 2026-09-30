/**
 * go.* (Ads-Modus): Neukundenpreise auf den freien Preisseiten /p/…
 * (Benjamin, 30.09.2026).
 *
 * Gleiche Regel wie #187/#188 (Preis x 0,8, auf ,99, Sternchen): Preise in
 * Hero, Preistabelle und Meta-Texten werden zum Neukundenpreis. Damit der
 * Rabatt nicht doppelt klingt, werden die vorhandenen Saetze "20% Rabatt fuer
 * Neukunden" auf "inkl." umgestellt - die Preise enthalten ihn bereits.
 * Schoenheits-OPs bleiben regulaer (applyNewCustomerPricesDeep laesst sie aus).
 */
import {
  applyNewCustomerPricesDeep,
  DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT,
} from "./newCustomerOffer.ts";

/** Slugs der Preisseiten und das Angebot, das ihr Hero zeigt. */
export const ADS_PRICE_PAGES: Readonly<Record<string, { pathKey?: string }>> = {
  // Muskelrelaxans-Zonen: Hero "ab 79,99 € pro Zone*" wie auf den Zonenseiten.
  "botox-kosten": { pathKey: "muskelrelaxans" },
  "hyaluron-spritzen-kosten": {},
  "skinbooster-preise": {},
};

export function isAdsPricePage(slug: string | null | undefined): boolean {
  return !!slug && Object.prototype.hasOwnProperty.call(ADS_PRICE_PAGES, slug);
}

// "20% Rabatt für Neukunden", "mit 20% Rabatt für neue Kunden!"
const DISCOUNT_CLAIM =
  /\s*(?:mit\s+)?(\d{1,2})\s?%\s*Rabatt\s+f(?:ü|ue)r\s+(?:Neukunden|neue\s+Kunden)\s*[.!]?/gi;

export function harmonizeDiscountClaims(value: string): string {
  return value.replace(
    DISCOUNT_CLAIM,
    (_m, pct: string, offset: number, whole: string) => {
      const before = whole.slice(0, offset).trimEnd();
      const sep = !before || /[.!?]$/.test(before) ? " " : " – ";
      return `${sep}Preise mit * inkl. ${pct} % Neukundenrabatt.`;
    },
  );
}

function deepStrings<T>(input: T, fn: (s: string, key?: string) => string): T {
  const walk = (value: any, key?: string): any => {
    if (typeof value === "string") return fn(value, key);
    if (Array.isArray(value)) return value.map((v) => walk(v, key));
    if (value !== null && typeof value === "object") {
      if (typeof value.url === "string" && typeof value.mime === "string") return value;
      const out: Record<string, any> = {};
      for (const [k, v] of Object.entries(value)) out[k] = walk(v, k);
      return out;
    }
    return value;
  };
  return walk(input);
}

const START_PRICE = /\bab\s+(\d{1,4}),(\d{2})\s?€/;

/**
 * Bereitet `data` einer /p/-Preisseite fuer go. auf. Der Hero bekommt einen
 * Preis (aus seiner Behandlung oder dem "ab …"-Preis seines Textes) und den
 * pathKey des Angebots; Hero, mitlaufende Leiste und Fussnote rechnen daraus
 * wie auf den Behandlungsseiten.
 */
export function prepareAdsPricePage<T extends Record<string, any>>(
  data: T,
  pct: number = DEFAULT_NEW_CUSTOMER_DISCOUNT_PCT,
): T {
  const conf = ADS_PRICE_PAGES[data?.slug as string];
  if (!conf) return data;

  // Den Startpreis vor der Umstellung lesen (danach steht dort der Neukundenpreis).
  const blocks = Array.isArray(data.blocks)
    ? data.blocks.map((block: any) => {
        if (block?.__component !== "blocks.treatment-hero") return block;
        let treatment = block.treatment;
        if (!treatment?.priceInEuroCent) {
          const m = START_PRICE.exec(String(block.text ?? ""));
          if (m) {
            treatment = {
              ...(treatment ?? {}),
              priceInEuroCent: Number(m[1]) * 100 + Number(m[2]),
              isStartingPrice: true,
            };
          }
        }
        return {
          ...block,
          treatment,
          ...(conf.pathKey ? { treatmentPathKey: conf.pathKey } : {}),
        };
      })
    : data.blocks;

  const withPrices = applyNewCustomerPricesDeep({ ...data, blocks }, pct);
  return deepStrings(withPrices, (s, key) =>
    key && /url|href|slug/i.test(key) ? s : harmonizeDiscountClaims(s),
  );
}
