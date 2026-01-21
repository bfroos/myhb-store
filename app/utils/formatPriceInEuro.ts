export type FormatPriceInEuroOptions = {
  /**
   * Optional prefix before the formatted price, e.g. "ab" or "für".
   *
   * Examples:
   * - prefix: "für" -> "für 149,99 €"
   * - prefix: "ab"  -> "ab 149,99 €"
   */
  prefix?: string;
  showCurrencySymbol?: boolean;
  /**
   * Return value when no valid price is available (e.g. 0 / undefined / NaN)
   */
  fallback?: string;
};

function parseEuroNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number")
    return Number.isFinite(value) ? value : undefined;
  if (typeof value !== "string") return undefined;

  const raw = value.trim();
  if (!raw) return undefined;

  // Strapi decimals usually come as "149.99"; also support "149,99" for safety.
  const normalized = raw.replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Format a price (in Euro) in German format.
 *
 * Examples:
 * - formatPriceInEuro(149.99) -> "149,99 €"
 * - formatPriceInEuro(149.99, { showCurrencySymbol: false }) -> "149,99"
 * - formatPriceInEuro(149.99, { isStartingPrice: true }) -> "ab 149,99 €"
 * - formatPriceInEuro(149.99, { showCurrencySymbol: false, isStartingPrice: true }) -> "ab 149,99"
 * - formatPriceInEuro(149.99, { prefix: "ab", showCurrencySymbol: false }) -> "ab 149,99"
 * - formatPriceInEuro(149.99, { prefix: "ab", showCurrencySymbol: false, isStartingPrice: true }) -> "ab 149,99"
 * - formatPriceInEuro(149.99, { prefix: "ab", showCurrencySymbol: false, isStartingPrice: true }) -> "ab 149,99"
 */
export function formatPriceInEuro(
  priceInEuroCent?: number,
  options: FormatPriceInEuroOptions = {},
): string {
  if (!priceInEuroCent) return "";

  const { prefix, fallback = "", showCurrencySymbol = true } = options;

  const value = parseEuroNumber(priceInEuroCent / 100);
  if (value === undefined || value <= 0) return fallback;

  const formatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  };

  if (showCurrencySymbol) {
    formatOptions.style = "currency";
    formatOptions.currency = "EUR";
    formatOptions.currencyDisplay = "symbol";
  } else {
    formatOptions.style = "decimal";
  }

  const formatted = new Intl.NumberFormat("de-DE", formatOptions).format(value);

  const resolvedPrefix = (prefix ?? "").trim();
  return resolvedPrefix ? `${resolvedPrefix} ${formatted}` : formatted;
}

export function formatPriceInEuroRange(
  priceInEuroCentMin?: number,
  priceInEuroCentMax?: number,
): string {
  if (!priceInEuroCentMin && !priceInEuroCentMax) return "";
  if (!priceInEuroCentMin) return formatPriceInEuro(priceInEuroCentMax);
  if (!priceInEuroCentMax) return formatPriceInEuro(priceInEuroCentMin);

  return (
    formatPriceInEuro(priceInEuroCentMin, { showCurrencySymbol: false }) +
    " – " +
    formatPriceInEuro(priceInEuroCentMax, { showCurrencySymbol: true })
  );
}
