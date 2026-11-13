import {
  resolveAppOnlyTarget,
  type AbSource,
  type BookingUrls,
  type ResolvedBooking,
} from "~/lib/bookingAbTest";

export type AppliedBooking = ResolvedBooking & { abSource?: AbSource };

/**
 * Ziel eines Buchungsknopfs.
 *
 * Der A/B-Split (#100) ist seit 07.10.2026 beendet, Calendly seit 13.11.2026
 * abgeschaltet: Gebucht wird nur noch ueber die App. Mit `appBookingUrl` des
 * Standorts oeffnet die App, sonst die Standortsuche. `ab_variant: "app"`
 * und `ab_source` bleiben an den Ereignissen, damit die Auswertungen weiter
 * dieselben Spalten sehen.
 */
export function useBookingAbTest() {
  const config = useRuntimeConfig();
  const siteMode: AbSource = config.public.siteMode === "ads" ? "ads" : "seo";

  function resolveBooking(urls: BookingUrls): AppliedBooking {
    return { ...resolveAppOnlyTarget(urls), abSource: siteMode };
  }

  return { resolveBooking };
}
