/**
 * Formatiert eine ganze Zahl mit Tausendertrennzeichen gemäß Locale.
 *
 * Beispiele:
 * - formatInteger(1234, "de-DE") → "1.234"
 * - formatInteger(1234, "en-US") → "1,234"
 *
 * @param value - Zu formatierende Zahl (wird auf ganze Zahl gerundet)
 * @param localeIso - ISO-Locale (z. B. "de-DE", "en-US")
 * @param options - Optionale Intl.NumberFormat-Optionen
 */
export function formatInteger(
  value: number,
  localeIso: string,
  options: Intl.NumberFormatOptions = {},
): string {
  const merged: Intl.NumberFormatOptions = {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    ...options,
  };
  return new Intl.NumberFormat(localeIso, merged).format(Math.round(value));
}
