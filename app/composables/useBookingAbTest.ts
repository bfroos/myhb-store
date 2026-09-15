import {
  readAbBookingConfig,
  resolveBookingTarget,
  type BookingUrls,
  type ResolvedBooking,
} from "~/lib/bookingAbTest";

/**
 * Zugang zum A/B-Split Calendly vs. App-Buchung (#100) fuer Dialoge und
 * Buttons: verheiratet die Env-Schalter aus `runtimeConfig.public` mit der
 * Bucket-Logik in lib/bookingAbTest.ts.
 *
 * Aufrufen erst beim Klick — nicht beim Rendern. Die Seiten liegen im
 * ISR-Cache; eine beim Rendern gezogene Variante waere fuer alle Besucher
 * dieselbe.
 */
export function useBookingAbTest() {
  const config = useRuntimeConfig();
  const abConfig = readAbBookingConfig(config.public as any);

  function resolveBooking(urls: BookingUrls): ResolvedBooking {
    return resolveBookingTarget(urls, abConfig);
  }

  return { resolveBooking, abConfig };
}
