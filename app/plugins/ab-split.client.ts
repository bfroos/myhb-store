/**
 * Zuweisung des A/B-Buckets Calendly vs. App-Buchung (#100).
 *
 * Laeuft **nur im Ads-Deployment** (`NUXT_PUBLIC_SITE_MODE=ads`, also
 * go.myhealthandbeauty.com). Die SEO-Seiten bleiben ausserhalb des Tests.
 *
 * Der Bucket wird beim Seitenaufruf gezogen — vor der Standortwahl, damit er
 * von ihr unabhaengig zufaellig ist (elanagency/myhb-os#87). Angewendet wird er
 * erst beim Oeffnen des Buchungsdialogs, wenn der Standort feststeht; das
 * passiert in useBookingAbTest/useCalendlyDialog.
 *
 * Was in die Datenschicht geht:
 *
 * - `{ ab_variant }` ohne `event` — setzt die Variable im Datenmodell des
 *   Containers, damit jedes spaetere Ereignis der Seite sie mitschicken kann
 *   (auch die Tags, die an `gtm.js` haengen). Gleiches Muster wie
 *   plugins/attribution-datalayer.client.ts.
 * - `ab_assigned` als eigenes Ereignis, wenn der Bucket neu gezogen wurde. Das
 *   ist der **Nenner** der Auswertung: so viele Besucher sind je Arm in den
 *   Test gekommen.
 *
 * Einwilligung: Ohne Cookiebot-Marketing-Consent wird nicht zugewiesen. Das
 * Banner antwortet spaeter als dieses Plugin laeuft, deshalb der Listener auf
 * `CookiebotOnAccept`. `?ab=app|calendly` erzwingt sofort — bewusste
 * Testhandlung, die nicht auf das Banner wartet.
 */
import {
  assignAbBucket,
  forcedAbVariant,
  readAbBookingConfig,
  type BookingVariant,
} from "~/lib/bookingAbTest";

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return;

  const config = useRuntimeConfig();
  if (config.public.siteMode !== "ads") return;

  const abConfig = readAbBookingConfig(config.public as any);
  // Aus ohne Anteil — ausser jemand erzwingt eine Variante zum Testen.
  if (abConfig.splitPercent <= 0 && !forcedAbVariant()) return;

  const pushToDataLayer = (payload: Record<string, unknown>) => {
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(payload);
  };

  const publish = (variant: BookingVariant, assigned: boolean) => {
    pushToDataLayer({ ab_variant: variant });
    if (assigned) {
      pushToDataLayer({
        event: "ab_assigned",
        event_category: "experiment",
        ab_variant: variant,
      });
    }
  };

  const run = () => {
    const { variant, assigned } = assignAbBucket(abConfig);
    if (variant) publish(variant, assigned);
    return !!variant;
  };

  nuxtApp.hook("app:mounted", () => {
    if (run()) return;
    // Noch keine Antwort im Banner: nachziehen, sobald sie da ist. Ein
    // zweites Mal zuweisen kann nicht passieren — das Cookie gewinnt.
    window.addEventListener("CookiebotOnAccept", () => run(), { once: true });
  });

  // Folgeseiten im selben Besuch: Variable erneut ins Datenmodell, damit sie
  // auch nach einem Routenwechsel an den Ereignissen haengt. Kein zweites
  // `ab_assigned` — der Nenner zaehlt Besucher, nicht Seitenaufrufe.
  nuxtApp.hook("page:finish", () => {
    const { variant } = assignAbBucket(abConfig);
    if (variant) pushToDataLayer({ ab_variant: variant });
  });
});
