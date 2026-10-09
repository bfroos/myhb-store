export default defineAppConfig({
  seo: {
    /**
     * Globale AggregateRating Werte für Schema.org
     * Basis: Google Business Profile Reviews
     * TODO: Später via Google Business Profile API automatisch aktualisieren
     */
    aggregateRating: {
      ratingValue: 4.9,
      reviewCount: 1692,
      source: "Google Business Profile (aggregated)",
      lastUpdated: "2026-10-09",
    },

    /**
     * Organization Schema Konfiguration
     */
    organization: {
      name: "My Health & Beauty",
      logo: {
        // TSEO-12: PNG statt Favicon-SVG (Google: mind. 112x112 px).
        url: "/favicon/web-app-manifest-512x512.png",
        fallback:
          "https://www.myhealthandbeauty.com/favicon/web-app-manifest-512x512.png",
      },
    },
  },
});
