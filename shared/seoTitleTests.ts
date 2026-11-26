/**
 * Titel-Test Standortseiten (26.11.2026, Benjamin: "Titel und Beschreibung macht Sinn").
 *
 * Search Console (28 Tage bis 24.11.): Botox Recklinghausen steht im Schnitt auf
 * Platz 4,1, bekommt aber nur 3 % Klicks (2.686 Impressionen), Botox Leipzig auf
 * Platz 4,8 mit 3,5 %. Ueblich waeren an diesen Plaetzen 5-7 %.
 *
 * Nur diese zwei Seiten bekommen einen neuen Title und eine neue Description,
 * alle anderen Standorte behalten das Muster "{Behandlung} {Stadt}: ab {Preis}".
 * So ist der Rest die Vergleichsgruppe. Nachmessen ab 4 Wochen nach Livegang:
 * CTR je Seite gegen die 4 Wochen davor und gegen die anderen Botox-Stadtseiten.
 *
 * Regeln wie sonst: echter Preis aus Strapi, kein Rabatt, keine Heilversprechen,
 * nur belegte Aussagen (aerztlich, Gespraech vorab, Kontrolle, ohne Termin).
 */
export type SeoTitleTest = {
  title: (priceTag: string) => string;
  description: (priceTag: string) => string;
};

export const SEO_TITLE_TESTS: Record<string, SeoTitleTest> = {
  "botox@recklinghausen/palais-vest": {
    title: (p) => (p ? `Botox Recklinghausen im Palais Vest – beim Arzt ${p}` : "Botox Recklinghausen im Palais Vest – beim Arzt"),
    description: (p) =>
      `Botox in Recklinghausen: ärztliche Faltenbehandlung im Palais Vest${p ? `, ${p}` : ""}. Mit Arztgespräch vorab und Kontrolle nach 14 Tagen, auch ohne Termin.`,
  },
  "botox@leipzig/hoefe-am-bruehl": {
    title: (p) => (p ? `Botox Leipzig in den Höfen am Brühl – beim Arzt ${p}` : "Botox Leipzig in den Höfen am Brühl – beim Arzt"),
    description: (p) =>
      `Botox in Leipzig: ärztliche Faltenbehandlung in den Höfen am Brühl${p ? `, ${p}` : ""}. Mit Arztgespräch vorab und Kontrolle nach 14 Tagen, auch ohne Termin.`,
  },
};

export function seoTitleTest(
  pathKey: string | null | undefined,
  citySlug: string | null | undefined,
  locationSlug: string | null | undefined,
): SeoTitleTest | null {
  const key = `${String(pathKey ?? "").replace(/^\/+|\/+$/g, "")}@${citySlug}/${locationSlug}`;
  return SEO_TITLE_TESTS[key] ?? null;
}
