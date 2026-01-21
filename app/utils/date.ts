/**
 * Extract date-only part (removes time) from a date string or Date object.
 * Handles ISO date strings (YYYY-MM-DD) and other date formats.
 */
export function dateOnly(date: string | Date): Date {
  if (typeof date === "string") {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    date = new Date(date);
  }
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Format a date using locale-specific formatting.
 * Uses ISO locale codes (e.g. "de-DE", "en-US") from i18n configuration.
 *
 * @param date - Date string or Date object to format
 * @param locale - ISO locale code (default: "de-DE")
 * @returns Formatted date string or empty string if date is invalid
 */
export function formatDate(
  date: string | Date | undefined,
  locale: string = "de-DE",
): string {
  if (!date) return "";
  return dateOnly(date).toLocaleDateString(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
