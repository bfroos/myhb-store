/**
 * Die iFrame-URL, die das Calendly-Widget aus einer Buchungs-URL baut (#141).
 *
 * `CalendlyInlineWidget` (nuxt-calendly) haengt die Embed-Parameter selbst an;
 * hier wird dieselbe Zeichenkette erzeugt, damit das Vorwaermen
 * (`useBookingPrewarm`) exakt das Dokument laedt, das der Dialog spaeter
 * anfordert. Eine abweichende Reihenfolge waere ein anderer Cache-Schluessel —
 * das Vorwaermen brauchte dann nur noch die Unterdateien und nicht mehr die
 * Seite selbst.
 *
 * Reihenfolge und Namen stammen aus `formatCalendlyUrl` der Bibliothek. Aendern
 * sich die `pageSettings` im Dialog, muss `PAGE_SETTINGS` hier mitziehen.
 */

/** Muss den `page-settings` in CalendlyDialog.vue entsprechen. */
export const PAGE_SETTINGS = {
  hideLandingPageDetails: true,
  hideEventTypeDetails: true,
  hideGdprBanner: true,
} as const;

export function calendlyEmbedUrl(url: string): string {
  const frageIndex = url.indexOf("?");
  const hatQuery = frageIndex > -1;
  const base = hatQuery ? url.slice(0, frageIndex) : url;
  const query = hatQuery ? url.slice(frageIndex + 1) : null;
  return `${base}?${[
    query,
    PAGE_SETTINGS.hideEventTypeDetails ? "hide_event_type_details=1" : null,
    PAGE_SETTINGS.hideLandingPageDetails ? "hide_landing_page_details=1" : null,
    PAGE_SETTINGS.hideGdprBanner ? "hide_gdpr_banner=1" : null,
    "embed_type=Inline",
    // Die Bibliothek setzt hier fest "1"; ohne das Feld schickt Calendly keine
    // Ereignisse an die einbettende Seite.
    "embed_domain=1",
  ]
    .filter(Boolean)
    .join("&")}`;
}

/** Zeigt die URL auf calendly.com? */
export function isCalendlyUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return host === "calendly.com" || host.endsWith(".calendly.com");
  } catch {
    return false;
  }
}
