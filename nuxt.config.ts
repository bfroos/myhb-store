import Aura from "@primeuix/themes/aura";
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

  // 3. Font-Optimierung: nur benötigte Weights, display:swap
  fonts: {
    provider: "bunny",
    families: [
      {
        name: "Inter",
        weights: [400, 500],
        styles: ["normal"],
        subsets: ["latin"],
        display: "swap",  // verhindert FOIT (Flash of Invisible Text)
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
        ...(process.env.NUXT_PUBLIC_MEDIA_URL
          ? [
              {
                rel: "preconnect" as const,
                href: new URL(process.env.NUXT_PUBLIC_MEDIA_URL).origin,
                crossorigin: "anonymous" as const,
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
        iso: "en-US",
        name: "English",
        dir: "ltr",
        file: "en.json",
      },
      {
        code: "tr",
        iso: "tr-TR",
        name: "Türkçe",
        dir: "ltr",
        file: "tr.json",
      },
      {
        code: "ar",
        iso: "ar-SA",
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
      "blog/c/[slug]": {
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
    },
  },

  routeRules:
    process.env.NODE_ENV === "production"
      ? {
          "/**": {
            isr: 900,
            // 5. Security & Performance Headers
            headers: {
              "x-content-type-options": "nosniff",
              "x-frame-options": "SAMEORIGIN",
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
          "/sitemap.xml": {
            isr: false,
            headers: {
              "cache-control":
                "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
            },
          },
          // Homepages 15 minutes
          "/": { isr: 900 },
          "/en": { isr: 900 },
          "/tr": { isr: 900 },
          "/ar": { isr: 900 },
          "/fr": { isr: 900 },
          "/nl": { isr: 900 },
          // Doctors 3 hours
          "/aerzte/[slug]": { isr: 10800 },
          "/en/doctors/[slug]": { isr: 10800 },
          "/tr/doktorlar/[slug]": { isr: 10800 },
          "/ar/atibba/[slug]": { isr: 10800 },
          "/fr/medecins/[slug]": { isr: 10800 },
          "/nl/artsen/[slug]": { isr: 10800 },
          // Treatments 15 minutes
          "/behandlungen": { isr: 900 },
          "/behandlungen/[...slug]": { isr: 900 },
          "/en/treatments": { isr: 900 },
          "/en/treatments/[...slug]": { isr: 900 },
          "/tr/tedaviler": { isr: 900 },
          "/tr/tedaviler/[...slug]": { isr: 900 },
          "/ar/ilajat": { isr: 900 },
          "/ar/ilajat/[...slug]": { isr: 900 },
          "/fr/traitements": { isr: 900 },
          "/fr/traitements/[...slug]": { isr: 900 },
          "/nl/behandelingen": { isr: 900 },
          "/nl/behandelingen/[...slug]": { isr: 900 },
          // Blog 6 hours
          "/blog": { isr: 21600 },
          "/blog/**": { isr: 21600 },
          "/en/blog": { isr: 21600 },
          "/en/blog/**": { isr: 21600 },
          "/tr/blog": { isr: 21600 },
          "/tr/blog/**": { isr: 21600 },
          "/ar/mudawwana": { isr: 21600 },
          "/ar/mudawwana/**": { isr: 21600 },
          "/fr/blog": { isr: 21600 },
          "/fr/blog/**": { isr: 21600 },
          "/nl/blog": { isr: 21600 },
          "/nl/blog/**": { isr: 21600 },
          // Careers 12 hours
          "/karriere": { isr: 43200 },
          "/karriere/**": { isr: 43200 },
          "/en/careers": { isr: 43200 },
          "/en/careers/**": { isr: 43200 },
          "/tr/kariyer": { isr: 43200 },
          "/tr/kariyer/**": { isr: 43200 },
          "/ar/masar-mihani": { isr: 43200 },
          "/ar/masar-mihani/**": { isr: 43200 },
          "/fr/carrieres": { isr: 43200 },
          "/fr/carrieres/**": { isr: 43200 },
          "/nl/carriere": { isr: 43200 },
          "/nl/carriere/**": { isr: 43200 },
          // General Pages 1 hour
          "/p/**": { isr: 3600 },
          "/en/p/*": { isr: 3600 },
          "/tr/p/*": { isr: 3600 },
          "/ar/p/*": { isr: 3600 },
          "/fr/p/*": { isr: 3600 },
          "/nl/p/*": { isr: 3600 },
          // Prices 15 minutes
          "/preise": { isr: 900 },
          "/en/prices": { isr: 900 },
          "/tr/fiyatlar": { isr: 900 },
          "/ar/asaar": { isr: 900 },
          "/fr/prix": { isr: 900 },
          "/nl/prijzen": { isr: 900 },
          // Products 15 minutes
          "/produkte": { isr: 900 },
          "/produkte/**": { isr: 900 },
          "/en/products": { isr: 900 },
          "/en/products/**": { isr: 900 },
          "/tr/urunler": { isr: 900 },
          "/tr/urunler/**": { isr: 900 },
          "/ar/muntajat": { isr: 900 },
          "/ar/muntajat/**": { isr: 900 },
          "/fr/produits": { isr: 900 },
          "/fr/produits/**": { isr: 900 },
          "/nl/producten": { isr: 900 },
          "/nl/producten/**": { isr: 900 },
          // Locations 15 minutes
          "/standorte": { isr: 900 },
          "/standorte/**": { isr: 900 },
          "/en/locations": { isr: 900 },
          "/en/locations/**": { isr: 900 },
          "/tr/konumlar": { isr: 900 },
          "/tr/konumlar/**": { isr: 900 },
          "/ar/mawaqea": { isr: 900 },
          "/ar/mawaqea/**": { isr: 900 },
          "/fr/lieux": { isr: 900 },
          "/fr/lieux/**": { isr: 900 },
          "/nl/locaties": { isr: 900 },
          "/nl/locaties/**": { isr: 900 },
          // About Us 6 hours
          "/ueber-uns": { isr: 21600 },
          "/en/about-us": { isr: 21600 },
          "/tr/hakkimizda": { isr: 21600 },
          "/ar/man-nahnu": { isr: 21600 },
          "/fr/a-propos": { isr: 21600 },
          "/nl/over-ons": { isr: 21600 },
        }
      : {},
});
