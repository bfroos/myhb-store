/**
 * Buchungs-Variante in der Datenschicht (frueher A/B-Split #100).
 *
 * Der Split ist seit 07.10.2026 beendet, Calendly seit 13.11.2026
 * abgeschaltet: Alle buchen ueber die App. Das Plugin zieht keinen Bucket mehr
 * und sendet kein `ab_assigned`. Es setzt nur noch `ab_variant: "app"` und
 * `ab_source` (ads|seo) ins Datenmodell, damit Tags und eigene
 * Trichter-Ereignisse (lib/firstPartyFunnel) weiter dieselben Spalten fuellen,
 * und schreibt einen alten Bucket aus der Testzeit auf `app` um.
 */
import { alignAbBucketToApp, type AbSource } from "~/lib/bookingAbTest";
import { setFunnelDefaults } from "~/lib/firstPartyFunnel";

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return;

  const config = useRuntimeConfig();
  const siteMode: AbSource = config.public.siteMode === "ads" ? "ads" : "seo";

  // Auch ohne Einwilligung (kein Cookie) traegt funnel_events Arm und Quelle.
  setFunnelDefaults({ variant: "app", source: siteMode });
  const setzeApp = () => {
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ ab_variant: "app", ab_source: siteMode });
  };
  nuxtApp.hook("app:mounted", () => {
    alignAbBucketToApp();
    setzeApp();
  });
  nuxtApp.hook("page:finish", setzeApp);
});
