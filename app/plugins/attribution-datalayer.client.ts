/**
 * Attribution in die Datenschicht spiegeln (Container GTM-5KCNWFWS).
 *
 * GTM-Tags, die nicht an unseren eigenen Events haengen (z. B. "GA4 - Termin
 * gebucht Conversion" auf der Dankesseite, Trigger auf gtm.js), kommen an die
 * Kampagnenwerte nur ueber Datenschichtvariablen. Genau ein Push mit den
 * flachen Keys reicht: GTMs Datenmodell behaelt die Werte fuer alle spaeteren
 * Events der Seite.
 *
 * Hinweis (#120): Die fruehere Begruendung hier — `gtag('event', ...)` loese
 * keine GTM-Trigger aus — war falsch. GTM erzeugt aus dem gtag-Aufruf ein
 * Ereignis mit dem Namen, nur liegen die Parameter dann unter `eventModel.*`
 * statt als Top-Level-Keys. Deshalb pusht useGoogleAnalytics.trackEvent
 * inzwischen selbst flache Objekte.
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
