/**
 * Zuweisung des A/B-Buckets Calendly vs. App-Buchung (#100).
 *
 * Laeuft in jedem Deployment, in dem `NUXT_PUBLIC_AB_BOOKING_SPLIT` gesetzt
 * ist — getrennt fuer Ads (go.myhealthandbeauty.com) und SEO (www). Ohne
 * Anteil passiert nichts, das ist der Auslieferungszustand fuer beide.
 *
 * Seit 16.09.2026 laeuft der Test auf Entscheidung von Benjamin auch auf dem
 * organischen Verkehr: mehr Faelle, schnellere Antwort. Damit die beiden
 * Toepfe nicht vermischt werden, traegt jedes Ereignis `ab_source` (ads|seo).
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
 *   Test gekommen — aufteilbar nach `ab_source`, weil bezahlter und
 *   organischer Verkehr verschiedene Grundkonversionsraten haben.
 *
 * Einwilligung: Ohne Cookiebot-Marketing-Consent wird nicht zugewiesen. Das
 * Banner antwortet spaeter als dieses Plugin laeuft, deshalb der Listener auf
 * `CookiebotOnAccept`. `?ab=app|calendly` erzwingt sofort — bewusste
 * Testhandlung, die nicht auf das Banner wartet.
 */
import {
  assignAbBucket,
  forcedAbVariant,
  istNurCalendlySeite,
  readAbBookingConfig,
  type AbSource,
  type BookingVariant,
} from "~/lib/bookingAbTest";
import { mirrorFunnelEvent } from "~/lib/firstPartyFunnel";

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return;

  const config = useRuntimeConfig();
  const siteMode: AbSource = config.public.siteMode === "ads" ? "ads" : "seo";

  const abConfig = readAbBookingConfig(config.public as any);
  // Aus ohne Anteil — ausser jemand erzwingt eine Variante zum Testen.
  if (abConfig.splitPercent <= 0 && !forcedAbVariant()) return;

  const pushToDataLayer = (payload: Record<string, unknown>) => {
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(payload);
  };

  const publish = (
    variant: BookingVariant,
    assigned: boolean,
    source: AbSource,
  ) => {
    pushToDataLayer({ ab_variant: variant, ab_source: source });
    if (assigned) {
      const zuteilung = {
        event: "ab_assigned",
        event_category: "experiment",
        ab_variant: variant,
        ab_source: source,
      };
      pushToDataLayer(zuteilung);
      // Nenner auch in der eigenen Datenbank (myhb-os#521).
      mirrorFunnelEvent(zuteilung);
    }
  };

  const run = () => {
    const { variant, assigned, source } = assignAbBucket(abConfig, siteMode);
    if (variant) publish(variant, assigned, source ?? siteMode);
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
    // Meta-Rabatt-Seiten stehen ausserhalb des Tests. Kam der Besucher von
    // einer Testseite, steht die Variante noch im Datenmodell und hinge sonst
    // an den Klicks von hier.
    if (istNurCalendlySeite()) {
      pushToDataLayer({ ab_variant: undefined, ab_source: undefined });
      return;
    }
    const { variant, source } = assignAbBucket(abConfig, siteMode);
    if (variant) {
      pushToDataLayer({ ab_variant: variant, ab_source: source ?? siteMode });
    }
  });
});
