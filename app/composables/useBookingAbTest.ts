import {
  readAbBucket,
  resolveBookingTarget,
  type BookingUrls,
  type ResolvedBooking,
} from "~/lib/bookingAbTest";

/**
 * Anwendung des A/B-Splits (#100) beim Oeffnen des Buchungsdialogs.
 *
 * Zugewiesen wird der Bucket schon beim Seitenaufruf
 * (plugins/ab-split.client.ts); hier faellt nur noch die Entscheidung zwischen
 * `calendlyUrl` und `appBookingUrl` des Standorts, der jetzt feststeht.
 *
 * Ausserhalb des Ads-Deployments wird gar nicht erst gefragt: Die SEO-Seiten
 * bleiben ausserhalb des Tests, auch wenn derselbe Besucher dort mit einem
 * Bucket-Cookie ankommt.
 */
export function useBookingAbTest() {
  const config = useRuntimeConfig();
  const isAdsMode = config.public.siteMode === "ads";

  function resolveBooking(urls: BookingUrls): ResolvedBooking {
    const bucket = isAdsMode ? readAbBucket() : undefined;
    return resolveBookingTarget(urls, bucket);
  }

  return { resolveBooking };
}
