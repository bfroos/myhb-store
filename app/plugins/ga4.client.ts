/**
 * gtag-Bruecke fuer GA4.
 *
 * GA4 (G-PB2XDTTPKZ) wird ueber den GTM-Container GTM-5KCNWFWS geladen; GTM
 * bringt sein eigenes `gtag` mit. Diese Seite konfiguriert GA4 deshalb NICHT
 * selbst — sonst liefe die Property doppelt.
 *
 * Was hier trotzdem passieren muss: den `gtag`-Stub sofort bereitstellen.
 * `useGoogleAnalytics().trackEvent` prueft `if (window.gtag)` und verwirft das
 * Event stillschweigend, wenn es die Funktion noch nicht gibt. GTM haengt
 * hinter dem Cookiebot-Banner und laedt entsprechend spaet — jeder Klick davor
 * war bisher verloren. Der Stub schiebt die Aufrufe in dieselbe `dataLayer`,
 * aus der der Google-Tag sie beim Laden nachverarbeitet.
 *
 * `NUXT_PUBLIC_GA_ID` ist bewusst nicht in `runtimeConfig.public` deklariert.
 * Setzt jemand die Variable trotzdem und ergaenzt den Key, konfiguriert diese
 * Datei GA4 zusaetzlich selbst — dann aber GTM entsprechend abruesten.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter();
  const gaId = useRuntimeConfig().public.gaId as string | undefined;

  window.dataLayer = window.dataLayer || [];
  // Kanonische Google-Form: der Google-Tag erwartet beim Nachverarbeiten das
  // `arguments`-Objekt, ein normales Array verhaelt sich anders.
  function gtag() {
    // eslint-disable-next-line prefer-rest-params
    (window as any).dataLayer.push(arguments);
  }
  if (!(window as any).gtag) {
    (window as any).gtag = gtag;
  }

  // Ohne eigene Mess-ID bleibt es beim Stub: GTM uebernimmt Konfiguration und
  // Seitenaufrufe (GA4 Enhanced Measurement inkl. History-Events).
  if (!gaId) return;

  gtag('js', new Date());
  gtag('config', gaId, {
    page_path: router.currentRoute.value.path,
    anonymize_ip: true,
  });

  router.afterEach((to) => {
    gtag('event', 'page_view', {
      page_path: to.path,
      page_title: document.title,
    });
  });
});
