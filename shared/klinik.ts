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

/**
 * Behandlung je OP-Seite (letztes Segment des pathKey). So heisst sie auch im
 * Lead-Board der App, darum dieselben Namen wie im Funnel "Welcher Eingriff"
 * (Strapi landing-page op-anfrage). Brust-OPs laufen dort gemeinsam.
 */
const BEHANDLUNG_JE_SEITE: Record<string, string> = {
  haartransplantation: "Haartransplantation",
  lidstraffung: "Lidstraffung",
  bruststraffung: "Brust-OP",
  brustvergroesserung: "Brust-OP",
  fettabsaugung: "Fettabsaugung",
  bauchdeckenstraffung: "Bauchdeckenstraffung",
  facelift: "Facelift",
  oberarmstraffung: "Oberarmstraffung",
  oberschenkelstraffung: "Oberschenkelstraffung",
};

/** Behandlungsnamen, die ein generischer Funnel als Antwort liefern kann. */
export const OP_BEHANDLUNGEN: ReadonlySet<string> = new Set(Object.values(BEHANDLUNG_JE_SEITE));

/** Behandlung zur OP-Seite; `null` auf der Kategorieseite oder bei Unbekanntem. */
export function behandlungFuerPfad(pathKey?: string | null): string | null {
  const key = (pathKey ?? "").replace(/^\/+/, "").replace(/\/+$/, "");
  const letztes = key.split("/").pop() ?? "";
  return BEHANDLUNG_JE_SEITE[letztes] ?? null;
}

/**
 * Seit 23.10.2026 (Benjamin): Der Knopf auf OP-Seiten oeffnet den Anfrage-Funnel
 * als Modal auf derselben Seite, die OP ist schon gewaehlt. Ziel-Form
 * `modal:<Behandlung>`; ohne Behandlung fragt der Funnel danach.
 */
export const ANFRAGE_MODAL_PREFIX = "modal:";
export const istAnfrageModal = (ziel?: string | null): ziel is string =>
  !!ziel && ziel.startsWith(ANFRAGE_MODAL_PREFIX);
export const modalBehandlung = (ziel: string): string | null =>
  ziel.slice(ANFRAGE_MODAL_PREFIX.length) || null;

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
  return `${ANFRAGE_MODAL_PREFIX}${behandlungFuerPfad(pathKey) ?? ""}`;
}

/**
 * Behandlung, die eine Anfrage im Board traegt: Ein generischer Funnel
 * ("Schoenheits-OP") nimmt die gewaehlte OP aus den Antworten, sonst landete
 * jede Anfrage von /lp/op-anfrage unter "Schoenheits-OP".
 */
export function behandlungDerAnfrage(funnelBehandlung: string, antworten: string[]): string {
  if (OP_BEHANDLUNGEN.has(funnelBehandlung)) return funnelBehandlung;
  return antworten.find((a) => OP_BEHANDLUNGEN.has(a)) ?? funnelBehandlung;
}

/** Strapi-Bloecke, die auf OP-Seiten nicht erscheinen (20-%-Aktion). */
export const KLINIK_AUSGEBLENDETE_BLOECKE: ReadonlySet<string> = new Set([
  "blocks.promo-banner",
  "blocks.promo-strip",
  "blocks.promo-hero",
  "blocks.promo-floating-sticker",
]);
