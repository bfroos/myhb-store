export default defineAppConfig({
  seo: {
    /**
     * Globale AggregateRating Werte für Schema.org
     * Basis: Google Business Profile Reviews
     * TODO: Später via Google Business Profile API automatisch aktualisieren
     */
    aggregateRating: {
      ratingValue: 5.0,
      reviewCount: 2737,
      source: "Google Business Profile",
      lastUpdated: "2026-05-28",
    },

    /**
     * Organization Schema Konfiguration
     */
    organization: {
      name: "MY HEALTH & BEAUTY",
      logo: {
        // TODO: Ersetzen durch echtes Markenlogo (mind. 112x112px, ideal 600x60px PNG)
        url: "/favicon/favicon.svg",
        fallback: "https://www.myhealthandbeauty.com/favicon/favicon.svg",
      },
    },
  },
});
