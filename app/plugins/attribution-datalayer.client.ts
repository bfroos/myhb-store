/**
 * Attribution in die Datenschicht spiegeln (Container GTM-5KCNWFWS).
 *
 * `gtag('event', ...)` landet als arguments-Eintrag in der Datenschicht und
 * loest deshalb *keine* GTM-Custom-Event-Trigger aus — GTM-Tags dieser Seite
 * (z. B. "GA4 - Termin gebucht Conversion" auf der Dankesseite) kommen an die
 * Kampagnenwerte nur ueber Datenschichtvariablen. Genau ein Push mit den
 * flachen Keys reicht: GTMs Datenmodell behaelt die Werte fuer alle spaeteren
 * Events der Seite.
 *
 * Laeuft im `app:mounted`-Hook statt im Plugin-Setup, damit die Reihenfolge
 * gegenueber plugins/utm-persist.client.ts (schreibt den Speicher) nicht von
 * der alphabetischen Plugin-Sortierung abhaengt.
 */
import { readGaAttributionParams } from "~/lib/attribution";

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return;

  nuxtApp.hook("app:mounted", () => {
    const params = readGaAttributionParams();
    if (!params) return;
    const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ ...params });
  });
});
