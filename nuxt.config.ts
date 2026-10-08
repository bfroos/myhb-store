import Aura from "@primeuix/themes/aura";

/**
 * ISR-Regel fuer Vercel: Laufzeit in Sekunden, Query-Parameter NICHT im
 * Cache-Key (TSEO-03).
 *
 * Ohne allowQuery legt Vercel fuer jeden Query-Wert einen eigenen Eintrag an.
 * Weil jede gclid einmalig ist, wurde damit jeder Anzeigenklick frisch
 * gerendert (gemessen 07.10.2026: go. mit ?gclid= MISS, 4,0 s statt 0,1 s).
 *
 * "url" muss in der Liste stehen: Das Vercel-Preset von Nitro leitet jede
 * ISR-Seite intern als /<route>-isr?url=<pfad> weiter. Mit allowQuery: []
 * fiele auch "url" aus dem Schluessel, und alle Seiten einer Regel teilten
 * sich einen einzigen Cache-Eintrag.
 *
 * Inhaltlich aendert das nichts: Vercel reicht die Query ohnehin nicht an das
 * Server-Rendern einer ISR-Seite durch (passQuery ist aus), alle
 * Query-abhaengige Logik laeuft im Browser. Die Strapi-Vorschau, die bisher
 * per ?_preview_refresh= am Cache vorbeikam, umgeht ihn jetzt ueber das
 * Cookie __prerender_bypass (server/routes/api/preview.ts).
 */
const isr = (expiration: number) => ({ expiration, allowQuery: ["url"] });
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  // ── PERFORMANCE OPTIMIERUNGEN ──────────────────────────────
  // 1. Nuxt Payload Optimierung: reduziert window.__NUXT__ inline JS
  experimental: {
    // inlineSSRStyles: kritische CSS inline rendern → verhindert FOUC und reduziert render-blocking CSS-Files.
    // true = kritische Styles kommen inline im HTML, Rest wird lazy geladen.
    inlineSSRStyles: true,
    payloadExtraction: true,      // Payload als separate Datei, nicht inline
    renderJsonPayloads: true,     // JSON-Payload komprimierbar
    // Komponenten-Islands: non-interactive Blöcke werden als statisches HTML gerendert
    componentIslands: true,
  },

  // 2. Vite Build-Optimierungen
  vite: {
    build: {
      // CSS Code-Splitting deaktivieren: verhindert 20+ kleine CSS-Dateien die Rendering blockieren.
      // Stattdessen: alle CSS in wenige grosse Chunks → weniger render-blocking requests.
      cssCodeSplit: false,
      // Moderne Browser anvisieren: weniger Transpilierung = ~90 KiB weniger JS.
      // Supports Chrome 90+, Firefox 88+, Safari 14+ (>95% der User).
      target: "es2020",
      rollupOptions: {
        output: {
          // JS Chunks sinnvoll aufteilen
          manualChunks: (id) => {
            if (id.includes("node_modules/primevue") || id.includes("node_modules/@primeuix")) {
              return "primevue";
            }
            if (id.includes("node_modules/@googlemaps")) {
              return "googlemaps";
            }
            if (id.includes("node_modules/@tabler")) {
              return "icons";
            }
          },
        },
      },
    },
    // Esbuild für schnelleres Minifizieren + moderne Syntax
    esbuild: {
      target: "es2020",
    },
  },

  modules: [
    "@nuxt/fonts",
    "@nuxtjs/i18n",
    "@primevue/nuxt-module",
    "nuxt-calendly",
    "@nuxt/scripts",
  ],

  // Calendly: Widget-Script erst bei Bedarf laden (spart ~120KB beim ersten Load)
  calendly: {
    loadWidgetCSS: true,
    loadWidgetCloseAnimation: true,
    lazyLoad: true,
  },

  // 🔍 Google Analytics 4 Setup
  // TSEO-13: Der fruehere Eintrag scripts.registry.googleAnalytics lud
  // gtag/js ohne Mess-ID - eine zweite, wirkungslose Kopie neben der aus GTM
  // (G-PB2XDTTPKZ ueber engine.myhealthandbeauty.com), und das vor der
  // Einwilligung. window.gtag stellt app/plugins/ga4.client.ts als Stub bereit,
  // GTMs Google-Tag verarbeitet die Aufrufe.

  // 3. Font-Optimierung: Weights + metrisch angepasster Fallback gegen CLS
  fonts: {
    provider: "bunny",
    // WICHTIG gegen Feld-CLS (0,21 auf Mobil): Die Schriftfamilie wird nur über
    // die CSS-Variable --font-family-base referenziert. Ohne processCSSVariables
    // schreibt @nuxt/fonts den metrisch angepassten Fallback NICHT in die
    // Variable → beim Fallback→Inter-Swap verschiebt sich das Layout (v.a. die
    // Hero-H1). Mit true wird der Fallback berücksichtigt und der Swap ist
    // layout-neutral.
    experimental: {
      processCSSVariables: true,
    },
    families: [
      {
        name: "Inter",
        // 600/700 ergänzt: einige Blöcke nutzen font-weight 600/700 (statt des
        // Tokens --font-bold=500). Ohne echtes Glyph gab es Fake-Bold + Swap.
        weights: [400, 500, 600, 700],
        styles: ["normal"],
        subsets: ["latin"],
        display: "swap", // verhindert FOIT; dank Fallback-Metriken CLS-neutral
        fallbacks: ["system-ui", "Arial"],
      },
    ],
  },

  app: {
    head: {
      viewport: "width=device-width, initial-scale=1",
      // 4. Resource Hints für externe Domains
      link: [
        // Performance: Stape/GTM Server-Side Tagging frühzeitig verbinden
        {
          rel: "preconnect" as const,
          href: "https://engine.myhealthandbeauty.com",
        },
        {
          rel: "dns-prefetch" as const,
          href: "https://engine.myhealthandbeauty.com",
        },
        // Performance: Facebook Pixel Domain vorverbinden (wichtig für Tracking)
        {
          rel: "dns-prefetch" as const,
          href: "https://connect.facebook.net",
        },
        // Performance: Cookiebot vorverbinden
        {
          rel: "preconnect" as const,
          href: "https://consent.cookiebot.com",
        },
        // #141: Das Buchungsfenster ist ein Calendly-iFrame. Ohne diese Zeilen
        // beginnen DNS, TLS und der erste Abruf erst mit dem Klick — mitten in
        // der Wartezeit, die das Ticket misst. Die Verbindung steht damit, bevor
        // jemand auf "Termin buchen" drueckt; die Seite selbst waermt
        // useBookingPrewarm vor.
        {
          rel: "preconnect" as const,
          href: "https://calendly.com",
        },
        {
          rel: "preconnect" as const,
          href: "https://assets.calendly.com",
          crossorigin: "anonymous" as const,
        },
        {
          rel: "dns-prefetch" as const,
          href: "https://calendly.com",
        },
        {
          rel: "dns-prefetch" as const,
          href: "https://assets.calendly.com",
        },
        ...(process.env.NUXT_PUBLIC_MEDIA_URL
          ? [
              // #180: ohne crossorigin. Hero-Bild, Bilder und Videos laden
              // ohne CORS; eine Verbindung mit crossorigin gehoert zu einem
              // anderen Verbindungs-Pool und wird dafuer nicht benutzt — das
              // LCP-Bild baute bisher trotz Preconnect eine eigene auf.
              {
                rel: "preconnect" as const,
                href: new URL(process.env.NUXT_PUBLIC_MEDIA_URL).origin,
              },
              {
                rel: "dns-prefetch" as const,
                href: new URL(process.env.NUXT_PUBLIC_MEDIA_URL).origin,
              },
            ]
          : []),
        ...(process.env.NUXT_PUBLIC_STRAPI_URL
          ? [
              {
                rel: "preconnect" as const,
                href: new URL(process.env.NUXT_PUBLIC_STRAPI_URL).origin,
                crossorigin: "anonymous" as const,
              },
            ]
          : []),
        {
          rel: "icon",
          type: "image/svg+xml",
          href: "/favicon/favicon.svg",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "96x96",
          href: "/favicon/favicon-96x96.png",
        },
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/favicon/apple-touch-icon.png",
        },
        {
          rel: "manifest",
          href: "/favicon/site.webmanifest",
        },
      ],
    },
  },

  i18n: {
    baseUrl:
      process.env.BASE_URL ||
      process.env.NUXT_PUBLIC_BASE_URL ||
      "http://localhost:3000",
    defaultLocale: "de",
    strategy: "prefix_except_default",
    detectBrowserLanguage: false,
    compilation: {
      strictMessage: false,
    },
    customRoutes: "config",
    langDir: "locales",
    locales: [
      {
        code: "de",
        iso: "de-DE",
        name: "Deutsch",
        dir: "ltr",
        file: "de.json",
      },
      {
        code: "en",
        iso: "en",
        name: "English",
        dir: "ltr",
        file: "en.json",
      },
      {
        code: "tr",
        iso: "tr",
        name: "Türkçe",
        dir: "ltr",
        file: "tr.json",
      },
      {
        code: "ar",
        iso: "ar",
        name: "العربية",
        dir: "rtl",
        file: "ar.json",
      },
      {
        code: "fr",
        iso: "fr",
        name: "Français",
        dir: "ltr",
        file: "fr.json",
      },
      {
        code: "nl",
        iso: "nl",
        name: "Nederlands",
        dir: "ltr",
        file: "nl.json",
      },
    ],
    pages: {
      behandlungen: {
        en: "/treatments",
        tr: "/tedaviler",
        ar: "/ilajat",
        fr: "/traitements",
        nl: "/behandelingen",
      },
      "behandlungen/[...slug]": {
        en: "/treatments/[...slug]",
        tr: "/tedaviler/[...slug]",
        ar: "/ilajat/[...slug]",
        fr: "/traitements/[...slug]",
        nl: "/behandelingen/[...slug]",
      },
      standorte: {
        en: "/locations",
        tr: "/konumlar",
        ar: "/mawaqea",
        fr: "/lieux",
        nl: "/locaties",
      },
      "standorte/[citySlug]/index": {
        en: "/locations/[citySlug]",
        tr: "/konumlar/[citySlug]",
        ar: "/konumlar/[citySlug]",
        fr: "/lieux/[citySlug]",
        nl: "/locaties/[citySlug]",
      },
      "standorte/[citySlug]/[locationSlug]/index": {
        en: "/locations/[citySlug]/[locationSlug]",
        tr: "/konumlar/[citySlug]/[locationSlug]",
        ar: "/konumlar/[citySlug]/[locationSlug]",
        fr: "/lieux/[citySlug]/[locationSlug]",
        nl: "/locaties/[citySlug]/[locationSlug]",
      },
      "standorte/[citySlug]/[locationSlug]/[...treatmentSlug]": {
        en: "/locations/[citySlug]/[locationSlug]/[...treatmentSlug]",
        tr: "/konumlar/[citySlug]/[locationSlug]/[...treatmentSlug]",
        ar: "/konumlar/[citySlug]/[locationSlug]/[...treatmentSlug]",
        fr: "/lieux/[citySlug]/[locationSlug]/[...treatmentSlug]",
        nl: "/locaties/[citySlug]/[locationSlug]/[...treatmentSlug]",
      },
      produkte: {
        en: "/products",
        tr: "/urunler",
        ar: "/muntajat",
        fr: "/produits",
        nl: "/producten",
      },
      "produkte/[categorySlug]/index": {
        en: "/products/[categorySlug]",
        tr: "/urunler/[categorySlug]",
        ar: "/muntajat/[categorySlug]",
        fr: "/produits/[categorySlug]",
        nl: "/producten/[categorySlug]",
      },
      "produkte/[categorySlug]/[productSlug]": {
        en: "/products/[categorySlug]/[productSlug]",
        tr: "/urunler/[categorySlug]/[productSlug]",
        ar: "/muntajat/[categorySlug]/[productSlug]",
        fr: "/produits/[categorySlug]/[productSlug]",
        nl: "/producten/[categorySlug]/[productSlug]",
      },
      blog: {
        en: "/blog",
        tr: "/blog",
        ar: "/mudawwana",
        fr: "/blog",
        nl: "/blog",
      },
      "blog/p/[page]": {
        en: "/blog/p/[page]",
        tr: "/blog/p/[page]",
        ar: "/mudawwana/p/[page]",
        fr: "/blog/p/[page]",
        nl: "/blog/p/[page]",
      },
      "blog/[slug]": {
        en: "/blog/[slug]",
        tr: "/blog/[slug]",
        ar: "/mudawwana/[slug]",
        fr: "/blog/[slug]",
        nl: "/blog/[slug]",
      },
      "blog/c/[slug]/index": {
        en: "/blog/c/[slug]",
        tr: "/blog/c/[slug]",
        ar: "/mudawwana/c/[slug]",
        fr: "/blog/c/[slug]",
        nl: "/blog/c/[slug]",
      },
      "blog/c/[slug]/p/[page]": {
        en: "/blog/c/[slug]/p/[page]",
        tr: "/blog/c/[slug]/p/[page]",
        ar: "/mudawwana/c/[slug]/p/[page]",
        fr: "/blog/c/[slug]/p/[page]",
        nl: "/blog/c/[slug]/p/[page]",
      },
      karriere: {
        en: "/careers",
        tr: "/kariyer",
        ar: "/masar-mihani",
        fr: "/carrieres",
        nl: "/carriere",
      },
      "karriere/aerzte": {
        en: "/careers/doctors",
        tr: "/kariyer/doktorlar",
        ar: "/masar-mihani/atibba",
        fr: "/carrieres/medecins",
        nl: "/carriere/artsen",
      },
      "karriere/jobs/[slug]": {
        en: "/careers/[slug]",
        tr: "/kariyer/[slug]",
        ar: "/masar-mihani/[slug]",
        fr: "/carrieres/[slug]",
        nl: "/carriere/[slug]",
      },
      preise: {
        en: "/prices",
        tr: "/fiyatlar",
        ar: "/asaar",
        fr: "/prix",
        nl: "/prijzen",
      },
      "ueber-uns": {
        en: "/about-us",
        tr: "/hakkimizda",
        ar: "/man-nahnu",
        fr: "/a-propos",
        nl: "/over-ons",
      },
      aerzte: {
        en: "/doctors",
        tr: "/doktorlar",
        ar: "/atibba",
        fr: "/medecins",
        nl: "/artsen",
      },
      "aerzte/[slug]": {
        en: "/doctors/[slug]",
        tr: "/doktorlar/[slug]",
        ar: "/atibba/[slug]",
        fr: "/medecins/[slug]",
        nl: "/artsen/[slug]",
      },
    },
  },

  primevue: {
    autoImport: false,
    components: {
      include: [
        "AutoComplete",
        "DynamicDialog",
        "IconField",
        "InputIcon",
        "InputText",
        "Message",
        "Paginator",
        "Select",
        "Toast",
      ],
    },
    options: {
      theme: {
        preset: {
          ...Aura,
          extend: {
            primitive: {
              surface: {
                0: "var(--color-white)",
                100: "var(--color-gray-100)",
                200: "var(--color-gray-200)",
                300: "var(--color-gray-300)",
                400: "var(--color-gray-400)",
                500: "var(--color-gray-500)",
                600: "var(--color-gray-600)",
                700: "var(--color-gray-700)",
                800: "var(--color-gray-800)",
                900: "var(--color-gray-900)",
              },
              primary: {
                0: "var(--color-white)",
                100: "var(--color-gray-100)",
                200: "var(--color-gray-200)",
                300: "var(--color-gray-300)",
                400: "var(--color-gray-400)",
                500: "var(--color-gray-500)",
                600: "var(--color-gray-600)",
                700: "var(--color-gray-700)",
                800: "var(--color-gray-800)",
                900: "var(--color-gray-900)",
              },
              gray: {
                0: "var(--color-white)",
                100: "var(--color-gray-100)",
                200: "var(--color-gray-200)",
                300: "var(--color-gray-300)",
                400: "var(--color-gray-400)",
                500: "var(--color-gray-500)",
                600: "var(--color-gray-600)",
                700: "var(--color-gray-700)",
                800: "var(--color-gray-800)",
                900: "var(--color-gray-900)",
              },
            },
          },
        },
        options: {
          darkModeSelector: "none",
        },
      },
    },
  },

  runtimeConfig: {
    redirectsFile: process.env.REDIRECTS_FILE,
    redirectsStrapiCacheTtlMs: 5 * 60 * 1000,
    redirectsStrapiEmptyCacheTtlMs: 30 * 1000,
    redirectsLocalCacheTtlMs: 24 * 60 * 60 * 1000,
    mailchimpApiKey: process.env.MAILCHIMP_API_KEY,
    mailchimpServerPrefix: process.env.MAILCHIMP_SERVER_PREFIX,
    mailchimpAudienceId: process.env.MAILCHIMP_AUDIENCE_ID,
    // HubSpot: Bewerbungsformular Aerzte (#102). Token ist ein Private-App-
    // Token mit crm.objects.contacts/deals (read+write), crm.objects.notes
    // (write) und files (write).
    //
    // In Vercel als NUXT_HUBSPOT_PRIVATE_APP_TOKEN setzen, nicht als
    // HUBSPOT_PRIVATE_APP_TOKEN: process.env wird beim Build ausgewertet und
    // waere damit im Bundle eingebacken. Der NUXT_-Name greift zur Laufzeit.
    // Pipeline-/Stage-ID nur setzen, wenn nicht in die Recruiting-Pipeline des
    // Produktiv-Portals geschrieben werden soll.
    hubspotPrivateAppToken: process.env.HUBSPOT_PRIVATE_APP_TOKEN,
    hubspotRecruitingPipelineId: process.env.HUBSPOT_RECRUITING_PIPELINE_ID,
    hubspotRecruitingStageId: process.env.HUBSPOT_RECRUITING_STAGE_ID,
    hubspotPortalId: process.env.HUBSPOT_PORTAL_ID,
    hubspotUiDomain: process.env.HUBSPOT_UI_DOMAIN,
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    googleGeolocationApiKey: process.env.GOOGLE_GEOLOCATION_API_KEY,
    siteMode: process.env.NUXT_PUBLIC_SITE_MODE,
    public: {
      strapiUrl: process.env.NUXT_PUBLIC_STRAPI_URL,
      publicUrl: process.env.NUXT_PUBLIC_URL,
      mediaUrl: process.env.NUXT_PUBLIC_MEDIA_URL,
      googleMapsKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_WEB_KEY,
      googleMapsMapId: process.env.NUXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
      siteMode: process.env.NUXT_PUBLIC_SITE_MODE,
      // A/B-Split Calendly vs. App-Buchung (#100): Anteil der Besucher in
      // Prozent, die die App-Buchung bekommen. Leer/0 = alle bekommen
      // Calendly; das ist der Auslieferungszustand. Wirkt nur im
      // Ads-Deployment, siehe app/lib/bookingAbTest.ts.
      abBookingSplit: process.env.NUXT_PUBLIC_AB_BOOKING_SPLIT,
      // 07.10.2026: Test beendet, nur noch App-Buchung (go. und www.). Leer =
      // an; "off" stellt den Split oben wieder her (Notbremse ohne Deploy),
      // siehe app/lib/bookingAbTest.ts.
      bookingAppOnly: process.env.NUXT_PUBLIC_BOOKING_APP_ONLY,
      // #141: Abschalter fuer das Vorwaermen des Buchungsfensters. Leer =
      // eingeschaltet, "off" = aus. Das Vorwaermen laedt calendly.com ohne
      // Zutun des Besuchers; wer das aus Einwilligungsgruenden nicht will,
      // stellt es je Deployment ab, ohne Code zu deployen.
      bookingPrewarm: process.env.NUXT_PUBLIC_BOOKING_PREWARM,
    },
  },

  // On-Demand-Revalidierung des ISR-Caches, siehe
  // server/routes/api/revalidate.post.ts. Vercel erneuert einen ISR-Pfad nur,
  // wenn ein GET/HEAD darauf den Header x-prerender-revalidate mit genau
  // diesem Token traegt. Ohne bypassToken schreibt das Vercel-Preset keinen in
  // die prerender-config.json, und dann gibt es keinen Weg, den Cache der
  // Plattform vor Ablauf des isr-Fensters zu erneuern - bei /karriere/** waeren
  // das 12 Stunden.
  // VERCEL_BYPASS_TOKEN muss in den Vercel-Projekt-Einstellungen gesetzt sein,
  // fuer Build UND Runtime, sonst weist Vercel den Header ab.
  nitro: {
    vercel: {
      config: {
        bypassToken: process.env.VERCEL_BYPASS_TOKEN,
      },
    },
  },

  routeRules:
    process.env.NODE_ENV === "production"
      ? {
          "/**": {
            isr: isr(900),
            // 5. Security & Performance Headers
            headers: {
              "x-content-type-options": "nosniff",
              // TSEO-10: go. (Ads) darf nie in den Index, auch nicht, wenn in
              // Strapi jemand metaRobots auf index stellt. Als Header gilt es
              // fuer jede Antwort, auch XML, TXT und statische Dateien.
              ...(process.env.NUXT_PUBLIC_SITE_MODE === "ads"
                ? { "x-robots-tag": "noindex, nofollow" }
                : {}),
              // x-frame-options intentionally omitted: CSP frame-ancestors in
              // csp-headers.ts handles iframe embedding for Strapi Live Preview.
              // SAMEORIGIN here would block the preview iframe in Strapi admin.
            },
          },
          "/api/**": {
            isr: false,
            headers: {
              "cache-control": "private, no-store",
              "cdn-cache-control": "no-store",
              "vercel-cdn-cache-control": "no-store",
            },
          },
          "/favicon/**": {
            headers: {
              "cache-control": "public, max-age=31536000, immutable",
            },
          },
          "/_nuxt/**": {
            headers: {
              "cache-control": "public, max-age=31536000, immutable",
            },
          },
          // Self-hosted Fonts (@nuxt/fonts) langfristig cachen (gehashte Dateinamen)
          "/_fonts/**": {
            headers: {
              "cache-control": "public, max-age=31536000, immutable",
            },
          },
          "/sitemap.xml": {
            isr: false,
            headers: {
              "cache-control":
                "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
            },
          },
          // Teil-Sitemaps (TSEO-05): kein ISR, damit ein 503 bei Strapi-Ausfall
          // nie im Cache landet; das CDN cached per Vercel-CDN-Cache-Control.
          "/sitemaps/**": { isr: false },
          // Homepages 15 minutes
          "/": { isr: isr(900) },
          "/en": { isr: isr(900) },
          "/tr": { isr: isr(900) },
          "/ar": { isr: isr(900) },
          "/fr": { isr: isr(900) },
          "/nl": { isr: isr(900) },
          // Doctors 3 hours
          "/aerzte/[slug]": { isr: isr(10800) },
          "/en/doctors/[slug]": { isr: isr(10800) },
          "/tr/doktorlar/[slug]": { isr: isr(10800) },
          "/ar/atibba/[slug]": { isr: isr(10800) },
          "/fr/medecins/[slug]": { isr: isr(10800) },
          "/nl/artsen/[slug]": { isr: isr(10800) },
          // Treatments 15 minutes
          "/behandlungen": { isr: isr(900) },
          "/behandlungen/[...slug]": { isr: isr(900) },
          "/en/treatments": { isr: isr(900) },
          "/en/treatments/[...slug]": { isr: isr(900) },
          "/tr/tedaviler": { isr: isr(900) },
          "/tr/tedaviler/[...slug]": { isr: isr(900) },
          "/ar/ilajat": { isr: isr(900) },
          "/ar/ilajat/[...slug]": { isr: isr(900) },
          "/fr/traitements": { isr: isr(900) },
          "/fr/traitements/[...slug]": { isr: isr(900) },
          "/nl/behandelingen": { isr: isr(900) },
          "/nl/behandelingen/[...slug]": { isr: isr(900) },
          // Blog 6 hours
          "/blog": { isr: isr(21600) },
          "/blog/**": { isr: isr(21600) },
          "/en/blog": { isr: isr(21600) },
          "/en/blog/**": { isr: isr(21600) },
          "/tr/blog": { isr: isr(21600) },
          "/tr/blog/**": { isr: isr(21600) },
          "/ar/mudawwana": { isr: isr(21600) },
          "/ar/mudawwana/**": { isr: isr(21600) },
          "/fr/blog": { isr: isr(21600) },
          "/fr/blog/**": { isr: isr(21600) },
          "/nl/blog": { isr: isr(21600) },
          "/nl/blog/**": { isr: isr(21600) },
          // Careers 12 hours
          "/karriere": { isr: isr(43200) },
          "/karriere/**": { isr: isr(43200) },
          "/en/careers": { isr: isr(43200) },
          "/en/careers/**": { isr: isr(43200) },
          "/tr/kariyer": { isr: isr(43200) },
          "/tr/kariyer/**": { isr: isr(43200) },
          "/ar/masar-mihani": { isr: isr(43200) },
          "/ar/masar-mihani/**": { isr: isr(43200) },
          "/fr/carrieres": { isr: isr(43200) },
          "/fr/carrieres/**": { isr: isr(43200) },
          "/nl/carriere": { isr: isr(43200) },
          "/nl/carriere/**": { isr: isr(43200) },
          // General Pages 1 hour
          "/p/**": { isr: isr(3600) },
          "/en/p/*": { isr: isr(3600) },
          "/tr/p/*": { isr: isr(3600) },
          "/ar/p/*": { isr: isr(3600) },
          "/fr/p/*": { isr: isr(3600) },
          "/nl/p/*": { isr: isr(3600) },
          // Prices 15 minutes
          "/preise": { isr: isr(900) },
          "/en/prices": { isr: isr(900) },
          "/tr/fiyatlar": { isr: isr(900) },
          "/ar/asaar": { isr: isr(900) },
          "/fr/prix": { isr: isr(900) },
          "/nl/prijzen": { isr: isr(900) },
          // Products 15 minutes
          "/produkte": { isr: isr(900) },
          "/produkte/**": { isr: isr(900) },
          "/en/products": { isr: isr(900) },
          "/en/products/**": { isr: isr(900) },
          "/tr/urunler": { isr: isr(900) },
          "/tr/urunler/**": { isr: isr(900) },
          "/ar/muntajat": { isr: isr(900) },
          "/ar/muntajat/**": { isr: isr(900) },
          "/fr/produits": { isr: isr(900) },
          "/fr/produits/**": { isr: isr(900) },
          "/nl/producten": { isr: isr(900) },
          "/nl/producten/**": { isr: isr(900) },
          // Locations 15 minutes
          "/standorte": { isr: isr(900) },
          "/standorte/**": { isr: isr(900) },
          "/en/locations": { isr: isr(900) },
          "/en/locations/**": { isr: isr(900) },
          "/tr/konumlar": { isr: isr(900) },
          "/tr/konumlar/**": { isr: isr(900) },
          "/ar/mawaqea": { isr: isr(900) },
          "/ar/mawaqea/**": { isr: isr(900) },
          "/fr/lieux": { isr: isr(900) },
          "/fr/lieux/**": { isr: isr(900) },
          "/nl/locaties": { isr: isr(900) },
          "/nl/locaties/**": { isr: isr(900) },
          // About Us 6 hours
          "/ueber-uns": { isr: isr(21600) },
          "/en/about-us": { isr: isr(21600) },
          "/tr/hakkimizda": { isr: isr(21600) },
          "/ar/man-nahnu": { isr: isr(21600) },
          "/fr/a-propos": { isr: isr(21600) },
          "/nl/over-ons": { isr: isr(21600) },
        }
      : {},
});
