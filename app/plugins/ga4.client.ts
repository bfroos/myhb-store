/**
 * gtag-Bruecke fuer GA4.
 *
 * GA4 (G-PB2XDTTPKZ) wird ueber den GTM-Container GTM-5KCNWFWS geladen; GTM
 * bringt sein eigenes `gtag` mit. Diese Seite konfiguriert GA4 deshalb NICHT
 * selbst — sonst liefe die Property doppelt.
 *
 * Was hier trotzdem passieren muss: den `gtag`-Stub sofort bereitstellen.
 * Einige Stellen rufen `window.gtag('event', ...)` noch direkt auf
 * (useNewsletterSignup, StrapiLandingPage, LandingPageSocial) und wuerden
 * das Event stillschweigend verwerfen, wenn es die Funktion noch nicht gibt.
 * GTM haengt hinter dem Cookiebot-Banner und laedt entsprechend spaet. Der
 * Stub schiebt die Aufrufe in dieselbe `dataLayer`, aus der GTM sie beim
 * Laden nachverarbeitet.
 *
 * `useGoogleAnalytics().trackEvent` braucht den Stub seit #120 nicht mehr: Es
 * pusht flache Objekte direkt in die Datenschicht, weil die Parameter eines
 * gtag-Aufrufs in GTM unter `eventModel.*` landen und die Datenschicht-
 * variablen des Containers (`booking_type` etc.) sie dort nicht sehen.
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
