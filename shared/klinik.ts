/**
 * Klinik-Regel (E28, myhb-app/myhb-os#1636, Benjamin 20.10.2026).
 *
 * OP-Behandlungen (Haartransplantation, Lidstraffung, Brust-OPs, ...) bucht
 * man nicht online und sie haben keinen 20-%-Neukundenrabatt. Jeder Knopf
 * fuehrt stattdessen in den Anfrage-Funnel; die Anfrage landet im Lead-Board
 * der App (lead_anfragen).
 *
 * Erkennung: Strapi `treatment.type` "operational"/"abulatory" ODER der
 * pathKey liegt unter "schoenheitsoperationen" (nicht jede OP-Seite hat ein
 * eigenes treatment mit type, z. B. die Kategorieseite).
 */

export const KLINIK_TREATMENT_TYPES: ReadonlySet<string> = new Set([
  "operational",
  "abulatory",
]);

export const KLINIK_PATH_PREFIX = "schoenheitsoperationen";

export const KLINIK_CTA_LABEL = "Kostenlose Analyse anfragen";

/** Funnel-Seiten (Strapi landing-page) je OP; alles andere: allgemeine OP-Anfrage. */
const ANFRAGE_SEITE: Record<string, string> = {
  "schoenheitsoperationen/haartransplantation": "/lp/haartransplantation",
};
export const ANFRAGE_SEITE_FALLBACK = "/lp/op-anfrage";

export function isKlinikBehandlung(input: {
  type?: string | null;
  pathKey?: string | null;
}): boolean {
  if (input.type && KLINIK_TREATMENT_TYPES.has(input.type)) return true;
  const key = (input.pathKey ?? "").replace(/^\/+/, "");
  return key === KLINIK_PATH_PREFIX || key.startsWith(`${KLINIK_PATH_PREFIX}/`);
}

/** Ziel des Anfrage-Knopfs fuer eine OP-Seite. */
export function anfrageZiel(pathKey?: string | null): string {
  const key = (pathKey ?? "").replace(/^\/+/, "").replace(/\/+$/, "");
  return ANFRAGE_SEITE[key] ?? ANFRAGE_SEITE_FALLBACK;
}

/** Strapi-Bloecke, die auf OP-Seiten nicht erscheinen (20-%-Aktion). */
export const KLINIK_AUSGEBLENDETE_BLOECKE: ReadonlySet<string> = new Set([
  "blocks.promo-banner",
  "blocks.promo-strip",
  "blocks.promo-hero",
  "blocks.promo-floating-sticker",
]);
