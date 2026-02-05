import Aura from "@primeuix/themes/aura";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],
  modules: [
    "@nuxt/fonts",
    "@nuxtjs/i18n",
    "@primevue/nuxt-module",
    "nuxt-calendly",
    "@nuxt/scripts",
  ],
  scripts: {
    registry: {
      googleTagManager: {
        id: "GTM-N5VCFKPR",
      },
    },
  },
  fonts: {
    provider: "bunny",
    families: [
      {
        name: "Inter",
        weights: [400, 500],
        styles: ["normal"],
        subsets: ["latin"],
      },
    ],
  },
  app: {
    head: {
      viewport: "width=device-width, initial-scale=1",
      link: [
        ...(process.env.NUXT_PUBLIC_MEDIA_URL
          ? [
              {
                rel: "preconnect" as const,
                href: new URL(process.env.NUXT_PUBLIC_MEDIA_URL).origin,
                crossorigin: "anonymous" as const,
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
          rel: "dns-prefetch",
          href: "https://www.googletagmanager.com",
        },
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
    ],
    pages: {
      behandlungen: {
        en: "/treatments",
        tr: "/tedaviler",
        ar: "/ilajat",
      },
      "behandlungen/[...slug]": {
        en: "/treatments/[...slug]",
        tr: "/tedaviler/[...slug]",
        ar: "/ilajat/[...slug]",
      },
      standorte: {
        en: "/locations",
        tr: "/konumlar",
        ar: "/mawaqea",
      },
      "standorte/[citySlug]/index": {
        en: "/locations/[citySlug]",
        tr: "/konumlar/[citySlug]",
        ar: "/konumlar/[citySlug]",
      },
      "standorte/[citySlug]/[locationSlug]/index": {
        en: "/locations/[citySlug]/[locationSlug]",
        tr: "/konumlar/[citySlug]/[locationSlug]",
        ar: "/konumlar/[citySlug]/[locationSlug]",
      },
      "standorte/[citySlug]/[locationSlug]/[...treatmentSlug]": {
        en: "/locations/[citySlug]/[locationSlug]/[...treatmentSlug]",
        tr: "/konumlar/[citySlug]/[locationSlug]/[...treatmentSlug]",
        ar: "/konumlar/[citySlug]/[locationSlug]/[...treatmentSlug]",
      },
      produkte: {
        en: "/products",
        tr: "/urunler",
        ar: "/muntajat",
      },
      "produkte/[categorySlug]/index": {
        en: "/products/[categorySlug]",
        tr: "/urunler/[categorySlug]",
        ar: "/muntajat/[categorySlug]",
      },
      "produkte/[categorySlug]/[productSlug]": {
        en: "/products/[categorySlug]/[productSlug]",
        tr: "/urunler/[categorySlug]/[productSlug]",
        ar: "/muntajat/[categorySlug]/[productSlug]",
      },
      blog: {
        en: "/blog",
        tr: "/blog",
        ar: "/mudawwana",
      },
      "blog/p/[page]": {
        en: "/blog/p/[page]",
        tr: "/blog/p/[page]",
        ar: "/mudawwana/p/[page]",
      },
      "blog/[slug]": {
        en: "/blog/[slug]",
        tr: "/blog/[slug]",
        ar: "/mudawwana/[slug]",
      },
      "blog/c/[slug]": {
        en: "/blog/c/[slug]",
        tr: "/blog/c/[slug]",
        ar: "/mudawwana/c/[slug]",
      },
      "blog/c/[slug]/p/[page]": {
        en: "/blog/c/[slug]/p/[page]",
        tr: "/blog/c/[slug]/p/[page]",
        ar: "/mudawwana/c/[slug]/p/[page]",
      },
      karriere: {
        en: "/careers",
        tr: "/kariyer",
        ar: "/masar-mihani",
      },
      "karriere/jobs/[slug]": {
        en: "/careers/[slug]",
        tr: "/kariyer/[slug]",
        ar: "/masar-mihani/[slug]",
      },
      preise: {
        en: "/prices",
        tr: "/fiyatlar",
        ar: "/asaar",
      },
      "ueber-uns": {
        en: "/about-us",
        tr: "/hakkimizda",
        ar: "/man-nahnu",
      },
      aerzte: {
        en: "/doctors",
        tr: "/doktorlar",
        ar: "/atibba",
      },
      "aerzte/[slug]": {
        en: "/doctors/[slug]",
        tr: "/doktorlar/[slug]",
        ar: "/atibba/[slug]",
      },
    },
  },
  primevue: {
    options: {
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: "none",
        },
      },
    },
  },
  runtimeConfig: {
    redirectsFile: process.env.REDIRECTS_FILE,
    mailchimpApiKey: process.env.MAILCHIMP_API_KEY,
    mailchimpServerPrefix: process.env.MAILCHIMP_SERVER_PREFIX,
    mailchimpAudienceId: process.env.MAILCHIMP_AUDIENCE_ID,
    public: {
      strapiUrl: process.env.NUXT_PUBLIC_STRAPI_URL,
      publicUrl: process.env.NUXT_PUBLIC_URL,
      mediaUrl: process.env.NUXT_PUBLIC_MEDIA_URL,
      googleMapsKey: process.env.NUXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      googleMapsMapId: process.env.NUXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
    },
  },
  routeRules: {
    // API routes: no caching (handled by server-side)
    "/api/strapi/**": {
      isr: false,
      headers: {
        "cache-control": "private, no-store",
        "cdn-cache-control": "no-store",
        "vercel-cdn-cache-control": "no-store",
      },
    },
    // Static assets: aggressive caching (1y, immutable)
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
    // Cache sitemap.xml (24h)
    "/sitemap.xml": {
      cache: { maxAge: 86400 },
    },
    // Cache redirect-lookup API (24h)
    "/api/redirect-lookup": {
      cache: { maxAge: 86400 },
    },
    "/": {
      isr: 3600,
    },
    "/en": {
      isr: 3600,
    },
    "/tr": {
      isr: 3600,
    },
    "/ar": {
      isr: 3600,
    },
    // ISR: Blog, Marketing, Docs etc. – 24h (rarely change)
    "/**": {
      isr: 86400,
    },
  },
});
