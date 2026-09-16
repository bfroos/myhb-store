import {
  readAbBookingConfig,
  readAbBucket,
  readAbSource,
  resolveBookingTarget,
  forcedAbVariant,
  type AbSource,
  type BookingUrls,
  type ResolvedBooking,
} from "~/lib/bookingAbTest";

export type AppliedBooking = ResolvedBooking & { abSource?: AbSource };

/**
 * Anwendung des A/B-Splits (#100) beim Oeffnen des Buchungsdialogs.
 *
 * Zugewiesen wird der Bucket schon beim Seitenaufruf
 * (plugins/ab-split.client.ts); hier faellt nur noch die Entscheidung zwischen
 * `calendlyUrl` und `appBookingUrl` des Standorts, der jetzt feststeht.
 *
 * Angewendet wird nur in einem Deployment, in dem der Split eingeschaltet ist
 * (`NUXT_PUBLIC_AB_BOOKING_SPLIT` > 0) oder in dem jemand mit `?ab=` testet.
 * Ein Besucher, der auf go. einen Bucket bekommen hat, aendert damit auf www
 * nichts, solange dort kein Anteil gesetzt ist — und umgekehrt. Der Env-Wert
 * je Projekt ist der einzige Schalter.
 *
 * `abSource` sagt, in welchem Deployment der Bucket gezogen wurde, und gehoert
 * an jedes Ereignis: Bezahlter und organischer Verkehr haben verschiedene
 * Grundkonversionsraten und duerfen in der Auswertung nicht verschmelzen.
 */
export function useBookingAbTest() {
  const config = useRuntimeConfig();
  const abConfig = readAbBookingConfig(config.public as any);
  const siteMode: AbSource = config.public.siteMode === "ads" ? "ads" : "seo";

  function resolveBooking(urls: BookingUrls): AppliedBooking {
    const aktiv = abConfig.splitPercent > 0 || !!forcedAbVariant();
    const bucket = aktiv ? readAbBucket() : undefined;
    const resolved = resolveBookingTarget(urls, bucket);
    return resolved.abVariant
      ? { ...resolved, abSource: readAbSource() ?? siteMode }
      : resolved;
  }

  return { resolveBooking };
}
