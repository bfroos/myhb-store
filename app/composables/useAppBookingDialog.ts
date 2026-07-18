import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";

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
      const parts = decodeURIComponent(match[1]).split(".");
      const gclid = parts[parts.length - 1];
      if (gclid && parts.length >= 3) ids.gclid = gclid;
    }
  }

  return ids;
}

/**
 * Appends any available click identifiers to the booking URL as query params.
 */
function buildBookingUrl(base: string): string {
  const ids = collectClickIds();
  const keys = Object.keys(ids);
  if (!keys.length) return base;
  try {
    const url = new URL(base);
    for (const key of keys) url.searchParams.set(key, ids[key]);
    return url.toString();
  } catch {
    return base;
  }
}

export function useAppBookingDialog() {
  const dialog = useDialog();

  function openAppBookingDialog(header?: string, url: string = APP_BOOKING_URL) {
    dialog.open(
      defineAsyncComponent(
        () => import("~/components/ui/organism/AppBookingDialog.vue"),
      ),
      {
        data: { url: buildBookingUrl(url) },
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
