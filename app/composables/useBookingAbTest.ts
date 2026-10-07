import {
  readAbBookingConfig,
  readAbBucket,
  readAbSource,
  resolveBookingTarget,
  forcedAbVariant,
  istNurCalendlySeite,
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
    // 07.10.2026: Test beendet, alle buchen wie der App-Arm — auch auf den
    // frueheren Nur-Calendly-Seiten. Ohne `appBookingUrl` faellt der Standort
    // sichtbar (`ab_fallback`) auf Calendly zurueck. Quelle ist das
    // Deployment, nicht mehr das Cookie der Testzeit.
    if (abConfig.appOnly) {
      const resolved = resolveBookingTarget(urls, "app");
      return { ...resolved, abSource: siteMode };
    }
    // Die Meta-Rabatt-Seiten buchen immer ueber Calendly (NUR_CALENDLY_PFADE).
    const aktiv =
      (abConfig.splitPercent > 0 || !!forcedAbVariant()) &&
      !istNurCalendlySeite();
    const bucket = aktiv ? readAbBucket() : undefined;
    const resolved = resolveBookingTarget(urls, bucket);
    return resolved.abVariant
      ? { ...resolved, abSource: readAbSource() ?? siteMode }
      : resolved;
  }

  return { resolveBooking, appOnly: abConfig.appOnly };
}
