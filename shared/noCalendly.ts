/**
 * Calendly ist abgeschaltet (13.11.2026): Gebucht wird nur noch ueber die App
 * (app.myhealthandbeauty.com/book-appointment?location=<venues.url_slug>).
 *
 * Strapi traegt an den Standorten noch das alte Feld `calendlyUrl`. Bisher ging
 * es ungefiltert in den Nuxt-Payload jeder Seite — so stand auf
 * /standorte/aachen/aquis-plaza die Calendly-Adresse aller Standorte im HTML,
 * und ein Plakat-QR-Code uebernahm eine davon. Der Strapi-Proxy wirft das Feld
 * deshalb zentral heraus, bevor eine Antwort Seite, Payload oder Cache erreicht.
 */
const ENTFERNTE_FELDER = new Set(["calendlyUrl"]);

export function stripCalendlyDeep<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripCalendlyDeep) as T;
  if (value === null || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (ENTFERNTE_FELDER.has(key)) continue;
    out[key] = stripCalendlyDeep(item);
  }
  return out as T;
}
