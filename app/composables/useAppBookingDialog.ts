import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";
import { readWireAttribution } from "~/lib/attribution";

/**
 * URL of the in-app booking flow (MY Health & Beauty app).
 * Opened inside a modal iframe as an alternative to the Calendly dialog.
 */
export const APP_BOOKING_URL =
  "https://app.myhealthandbeauty.com/book-appointment";

/**
 * Returns true when the given URL points at the in-app booking flow
 * (app.myhealthandbeauty.com). Used to route the booking CTA to the in-app
 * iframe dialog instead of the Calendly widget, so locations can be migrated
 * from Calendly to the app one at a time simply by changing the
 * "Calendly URL" field in Strapi. Calendly URLs (calendly.com/...) return
 * false and keep using the Calendly widget.
 */
export function isAppBookingUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const appHost = new URL(APP_BOOKING_URL).hostname;
    return new URL(url).hostname === appHost;
  } catch {
    return false;
  }
}

/**
 * Adds a `treatment=<slug>` query param to an in-app booking URL so the app
 * pre-selects the matching treatment (deeplink). The venue (`location=`) is
 * already part of the URL configured per location in Strapi, so we only inject
 * the treatment here.
 *
 * No-ops (returns the URL unchanged) when there is no URL, no treatment slug,
 * or the URL is not an in-app booking URL (e.g. a calendly.com URL) — so
 * Calendly locations and locations without a treatment slug keep working.
 */
export function withAppTreatmentSlug(
  url?: string | null,
  treatmentSlug?: string | null,
): string | undefined {
  if (!url) return undefined;
  if (!treatmentSlug || !isAppBookingUrl(url)) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("treatment", treatmentSlug);
    return u.toString();
  } catch {
    return url;
  }
}

/**
 * Resolves the slug that is appended as `treatment=` to an in-app booking URL.
 *
 * Prefers the `appTreatmentSlug` field maintained in Strapi (the app's own
 * treatment slug, e.g. "lipfiller"); falls back to the page slug of the
 * website (e.g. "lippen-aufspritzen"), which the app resolves via its alias
 * table (bfroos/myhb-store#66, docs/DEEPLINKS.md in elanagency/myhb-os). An
 * unknown slug does not break the flow: the app keeps the pre-selected venue
 * and only shows a subtle hint.
 */
export function resolveAppTreatmentSlug(page?: {
  appTreatmentSlug?: string | null;
  slug?: string | null;
} | null): string | undefined {
  return page?.appTreatmentSlug?.trim() || page?.slug?.trim() || undefined;
}

/**
 * Collects Google Ads click identifiers so the in-app booking flow (rendered
 * in an iframe on the app.* subdomain) can attribute the conversion to the
 * originating ad click. Reads from the current URL first, then falls back to
 * the _gcl_aw cookie (set by Google auto-tagging on the store domain).
 */
function collectClickIds(): Record<string, string> {
  const ids: Record<string, string> = {};
  if (typeof window === "undefined") return ids;

  const params = new URLSearchParams(window.location.search);
  for (const key of ["gclid", "gbraid", "wbraid", "gclsrc"]) {
    const val = params.get(key);
    if (val) ids[key] = val;
  }

  // Fallback: extract gclid from the _gcl_aw cookie ("GCL.<timestamp>.<gclid>")
  if (!ids.gclid && !ids.gbraid && !ids.wbraid) {
    const match = document.cookie.match(/(?:^|;\s*)_gcl_aw=([^;]+)/);
    if (match) {
      const parts = decodeURIComponent(match[1] ?? "").split(".");
      const gclid = parts[parts.length - 1];
      if (gclid && parts.length >= 3) ids.gclid = gclid;
    }
  }

  return ids;
}

const UTM_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

/**
 * Splits the touchpoints click_id format ("gclid:abc" | "fbclid:abc" |
 * "ttclid:abc") back into a query parameter name + value.
 */
function splitClickId(
  clickId?: string,
): { key: "gclid" | "fbclid" | "ttclid"; value: string } | null {
  if (!clickId) return null;
  const idx = clickId.indexOf(":");
  if (idx <= 0) return null;
  const key = clickId.slice(0, idx);
  const value = clickId.slice(idx + 1);
  if (!value) return null;
  if (key === "gclid" || key === "fbclid" || key === "ttclid") {
    return { key, value };
  }
  return null;
}

/**
 * Conversion-Audit #67: Der Calendly-Pfad bekommt utm_* und Klick-IDs ueber
 * das utm-persist-Plugin dekoriert, der App-Pfad bekam bisher nur gclid/
 * gbraid/wbraid. Damit die App (app.* Subdomain, eigener Storage) dieselbe
 * Quelle sieht wie Newsletter und Calendly, haengen wir hier den
 * Attributionsspeicher (First/Last Touch) als Query-Parameter an:
 *
 *   utm_source, utm_medium, utm_campaign, utm_term, utm_content  (Last Touch,
 *                                                                 Fallback First)
 *   gclid | fbclid | ttclid                                       (Last, Fallback First)
 *   ft_source, ft_medium, ft_campaign, ft_click_id                (First Touch, nur
 *                                                                 wenn abweichend)
 *   ref_path                                                      (Seite, von der
 *                                                                 gebucht wurde)
 *
 * Werte aus der aktuellen URL (frischer Klick) haben Vorrang vor dem Speicher.
 */
export function collectAttributionParams(): Record<string, string> {
  const params: Record<string, string> = {};
  if (typeof window === "undefined") return params;

  const current = new URLSearchParams(window.location.search);
  for (const key of UTM_PARAMS) {
    const val = current.get(key);
    if (val) params[key] = val;
  }
  for (const key of ["gclid", "fbclid", "ttclid"] as const) {
    const val = current.get(key);
    if (val) params[key] = val;
  }

  const stored = readWireAttribution();
  const last = stored?.last ?? stored?.first;
  const first = stored?.first;

  if (last) {
    for (const key of UTM_PARAMS) {
      if (!params[key] && last[key]) params[key] = last[key] as string;
    }
    const cid = splitClickId(last.click_id) ?? splitClickId(first?.click_id);
    if (cid && !params.gclid && !params.fbclid && !params.ttclid) {
      params[cid.key] = cid.value;
    }
  }

  if (first && first !== last) {
    if (first.utm_source && first.utm_source !== params.utm_source) {
      params.ft_source = first.utm_source;
    }
    if (first.utm_medium && first.utm_medium !== params.utm_medium) {
      params.ft_medium = first.utm_medium;
    }
    if (first.utm_campaign && first.utm_campaign !== params.utm_campaign) {
      params.ft_campaign = first.utm_campaign;
    }
    const firstCid = splitClickId(first.click_id);
    if (firstCid && params[firstCid.key] !== firstCid.value) {
      params.ft_click_id = first.click_id as string;
    }
  }

  const refPath = window.location.pathname;
  if (refPath) params.ref_path = refPath;

  return params;
}

export type AppBookingUrlOptions = {
  /** Rabattcode (z. B. Neukundenrabatt nach Newsletter-Anmeldung, #82/#74). */
  promo?: string | null;
};

/**
 * Appends click identifiers, UTM/attribution params and an optional promo
 * code to the booking URL as query params. Existing params on the URL
 * (e.g. venue/treatment deeplink) are kept; attribution never overrides them.
 */
export function buildBookingUrl(
  base: string,
  options?: AppBookingUrlOptions,
): string {
  try {
    const url = new URL(base);
    for (const [key, value] of Object.entries(collectClickIds())) {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    }
    for (const [key, value] of Object.entries(collectAttributionParams())) {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    }
    if (options?.promo && !url.searchParams.has("promo")) {
      url.searchParams.set("promo", options.promo);
    }
    return url.toString();
  } catch {
    return base;
  }
}

export function useAppBookingDialog() {
  const dialog = useDialog();

  function openAppBookingDialog(
    header?: string,
    url: string = APP_BOOKING_URL,
    options?: AppBookingUrlOptions,
  ) {
    dialog.open(
      defineAsyncComponent(
        () => import("~/components/ui/organism/AppBookingDialog.vue"),
      ),
      {
        data: { url: buildBookingUrl(url, options) },
        props: {
          modal: true,
          draggable: false,
          header: header || "Termin buchen",
          style: {
            width: "600px",
            height: "98svh",
            maxHeight: "98svh",
            margin: "0",
            padding: "0",
          },
          contentStyle: {
            height: "100%",
            padding: "0",
          },
          breakpoints: {
            "960px": "100vw",
            "640px": "100vw",
          },
        },
      },
    );
  }

  return { openAppBookingDialog };
}
