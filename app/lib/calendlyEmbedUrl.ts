import { tryUseNuxtApp } from "#app";

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

/**
 * Setzt die Sprache des Widgets fest (#141).
 *
 * Ohne `locale` richtet sich Calendly nach der Browsersprache des Besuchers.
 * Auf einer deutschen Landingpage stand damit bei jedem, dessen Browser auf
 * Englisch steht, "Date & Time", "Next available slot" und Mon/Tue/Wed — auf
 * einer Seite, die Vertrauen fuer einen medizinischen Termin aufbauen soll.
 * Nachgeprueft am 20.09.2026: `?locale=de` setzt das Widget vollstaendig auf
 * Deutsch ("Datum & Uhrzeit waehlen", Mo/Di/Mi), unabhaengig vom Browser.
 *
 * Ein vorhandener Wert bleibt stehen — eine in Strapi gepflegte URL darf ihre
 * eigene Sprache behalten.
 */
export function withCalendlyLocale(
  url: string,
  locale: string | undefined,
): string {
  const kurz = (locale ?? "").slice(0, 2).toLowerCase();
  if (!kurz || !isCalendlyUrl(url)) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.get("locale")) u.searchParams.set("locale", kurz);
    // #186 (nur go.): am Monatsende gleich den Folgemonat zeigen. Dialog und
    // Vorwaermen bauen die URL beide hier, bleiben also deckungsgleich.
    if (isAdsModeClient() && !u.searchParams.get("month")) {
      const month = calendlyStartMonth(new Date());
      if (month) u.searchParams.set("month", month);
    }
    return u.toString();
  } catch {
    return url;
  }
}

/** Letzte Tage eines Monats, an denen der Kalender im Folgemonat startet. */
export const MONTH_END_DAYS = 3;

/**
 * #186: Am 29.09. war im Kalender nur noch der 30.09. waehlbar, Oktober erst
 * per Pfeil. In den letzten MONTH_END_DAYS Tagen (heute mitgezaehlt) startet
 * das Widget deshalb im Folgemonat (`month=JJJJ-MM`), sonst `null`.
 */
export function calendlyStartMonth(now: Date): string | null {
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = lastDay - now.getDate() + 1;
  if (daysLeft > MONTH_END_DAYS) return null;
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

function isAdsModeClient(): boolean {
  if (!import.meta.client) return false;
  try {
    return tryUseNuxtApp()?.$config?.public?.siteMode === "ads";
  } catch {
    return false;
  }
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

/**
 * Der Termintyp "Behandlungstermin" je Calendly-Konto (#148).
 *
 * Die Standort-URLs in Strapi zeigen auf das Konto (`calendly.com/koeln-arcaden`);
 * Calendly fragt dann zuerst nach der Terminart — Behandlungstermin, kostenloses
 * Beratungsgespraech, Vitamin-Infusion. Wer von einer Behandlungsseite kommt
 * ("Lippen aufspritzen", beworben mit 60 EUR am Tag), hat diese Frage schon
 * beantwortet; die Zwischenseite kostet einen Schritt und eine Ladezeit.
 *
 * Die Slugs sind je Konto verschieden (`behandlungstermin`, `-dua`, `-30min`,
 * `-30min-klon`) und stammen aus der oeffentlichen Calendly-Antwort
 * `/api/booking/profiles/<konto>/event_types`, abgefragt am 22.09.2026. Ein
 * Konto, das hier fehlt, behaelt die Konto-URL — der Weg bleibt dann wie bisher.
 * mediapark-klinik hat keine Termintypen.
 */
export const CALENDLY_TREATMENT_EVENT: Readonly<Record<string, string>> = {
  "koeln-arcaden": "behandlungstermin",
  "duesseldorf-arcaden": "behandlungstermin-dua",
  "gesundbrunnen-center-berlin": "behandlungstermin",
  "forum-duisburg": "behandlungstermin-30min-klon",
  "k-in-lautern": "behandlungstermin-30min",
  "hoefe-am-bruehl-leipzig": "behandlungstermin-30min",
  "minto-moenchengladbach": "behandlungstermin",
  "palais-vest-recklinghausen": "behandlungstermin",
  "aquis-plaza-aachen": "behandlungstermin-30min",
};

/**
 * Haengt den Behandlungstermin-Typ an eine Konto-URL (#148).
 *
 * Nur wenn die Seite eine Behandlung meint (`treatmentType` gesetzt), nur bei
 * Calendly, und nur, wenn die URL noch auf das Konto zeigt — eine in Strapi
 * gepflegte Termintyp-URL bleibt unangetastet.
 */
export function withCalendlyTreatmentEvent(
  url: string | undefined,
  treatmentType: string | null | undefined,
): string | undefined {
  if (!url || !treatmentType || !isCalendlyUrl(url)) return url;
  try {
    const u = new URL(url);
    const teile = u.pathname.split("/").filter(Boolean);
    if (teile.length !== 1) return url;
    const konto = teile[0]!;
    const termintyp = CALENDLY_TREATMENT_EVENT[konto];
    if (!termintyp) return url;
    u.pathname = `/${konto}/${termintyp}`;
    return u.toString();
  } catch {
    return url;
  }
}
