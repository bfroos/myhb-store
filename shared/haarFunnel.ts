/**
 * Haaranalyse im Anfrage-Modal der Seite Haartransplantation (13.11.2026).
 *
 * Das Modal nahm bisher nur den Frauen-Funnel aus Strapi (/lp/haartransplantation).
 * Jetzt fragt es zuerst "Frau oder Mann?" und laeuft dann weiter wie
 * - Frau: die Fragen aus Strapi (unveraendert),
 * - Mann: die Fragen aus dem Maenner-Funnel /lp/haartransplantation-maenner/
 *   (Ausgangslage mit Michaels Bildern, Alter; ohne Graft-Schaetzung).
 *
 * Die Antworten gehen wie im Maenner-Funnel mit "Geschlecht", "Ausgangslage",
 * "Alter" an die App; die Frauen-Antworten tragen weiter den Fragetext.
 */

export type HaarFunnelOption = {
  label: string;
  /** Strapi-Medium (Strapi-Funnel). */
  image?: unknown;
  /** Statisches Bild aus public/ (Maenner-Funnel). */
  imageSrc?: string | null;
  illustration?: string | null;
  hint?: string | null;
};

export type HaarFunnelStep = {
  question: string;
  fieldKey?: string | null;
  layout?: "tiles" | "list" | "grid" | null;
  options?: HaarFunnelOption[];
  /** Frage-Schluessel in der Anfrage an die App; sonst der Fragetext. */
  leadFrage?: string | null;
};

export const GESCHLECHT_FRAGE: HaarFunnelStep = {
  question: "Frau oder Mann?",
  fieldKey: "geschlecht",
  leadFrage: "Geschlecht",
  layout: "tiles",
  options: [{ label: "Frau" }, { label: "Mann" }],
};

/** Aus dem Maenner-Funnel (public/lp/haartransplantation-maenner, Fluss gender → stage → age). */
export const MAENNER_SCHRITTE: HaarFunnelStep[] = [
  {
    question: "Wie würdest du deinen Haarausfall beschreiben?",
    fieldKey: "problembereich",
    leadFrage: "Ausgangslage",
    layout: "grid",
    options: [
      { label: "Geheimratsecken", imageSrc: "/lp/haartransplantation-maenner/ausfall/geheimratsecken.webp", illustration: "geheimratsecken" },
      { label: "Tonsur", imageSrc: "/lp/haartransplantation-maenner/ausfall/tonsur.webp", illustration: "tonsur" },
      { label: "Kompletter Oberkopf", imageSrc: "/lp/haartransplantation-maenner/ausfall/kompletter-oberkopf.webp", illustration: "oberkopf" },
      { label: "Lichtes Haar", imageSrc: "/lp/haartransplantation-maenner/ausfall/lichtes-haar.webp", illustration: "licht" },
    ],
  },
  {
    question: "Wie alt bist du?",
    fieldKey: "alter",
    leadFrage: "Alter",
    layout: "grid",
    options: ["18–29", "30–39", "40–49", "50+"].map((label) => ({ label })),
  },
];

/**
 * Sichtbare Fragetexte, die die Inhaberin geaendert haben will (13.11.2026).
 * Die Texte stehen in Strapi; bis sie dort geaendert sind, ersetzt die
 * Website sie. Der Schluessel an die App bleibt der alte Text, damit die
 * Zuordnung im Lead-Board (leadFelder.ts) unveraendert greift.
 */
export const FRAGE_KORREKTUREN: Record<string, string> = {
  "Seit wann beschäftigt dich das?": "Seit wann beschäftigt dich das Thema?",
  "Wann möchtest du den Eingriff ungefähr?": "Wann möchtest du den Eingriff ungefähr durchführen?",
};

export function korrigiereFrage<T extends HaarFunnelStep>(step: T): T {
  const neu = FRAGE_KORREKTUREN[step.question.trim()];
  if (!neu) return step;
  return { ...step, question: neu, leadFrage: step.leadFrage ?? step.question };
}

/**
 * Schritte des Modals: erst Geschlecht, dann je nach Antwort die Frauen-Fragen
 * aus Strapi oder die Maenner-Fragen. Ohne Antwort (noch auf Schritt 1) zaehlt
 * der laengere Frauen-Weg.
 */
export function haarFunnelSchritte<T extends HaarFunnelStep>(
  frauenSchritte: T[],
  geschlecht: string | null | undefined,
): HaarFunnelStep[] {
  return [GESCHLECHT_FRAGE, ...(geschlecht === "Mann" ? MAENNER_SCHRITTE : frauenSchritte)];
}

/** Antworten fuer /api/lead-anfrage: [{frage, antwort}] wie bisher. */
export function leadAntworten(
  schritte: HaarFunnelStep[],
  antworten: (string | undefined)[],
): { frage: string; antwort: string }[] {
  return schritte.map((s, i) => ({ frage: s.leadFrage || s.question, antwort: antworten[i] ?? "" }));
}

/** Telefon ist bei OP-Anfragen Pflicht (13.11.2026). */
export function pruefeTelefon(telefon: string | null | undefined): string | null {
  const t = (telefon ?? "").trim();
  if (!t) return "Bitte gib deine Telefonnummer an, damit wir dich erreichen können.";
  if (t.replace(/[^\d]/g, "").length < 6) return "Bitte prüf deine Telefonnummer.";
  return null;
}
