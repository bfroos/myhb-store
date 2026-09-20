/**
 * Auswahlwerte des Bewerbungsformulars Aerzte (bfroos/myhb-store#102).
 *
 * Liegt in `shared/`, weil Formular und Server-Route denselben Satz brauchen:
 * das Formular zum Anzeigen, die Route zum Validieren und zum Beschriften des
 * HubSpot-Eintrags. Ein zweiter Satz Konstanten waere genau die Stelle, an der
 * ein neuer Wert in HubSpot ankommt, den dort niemand erwartet.
 *
 * Die `value`s gehen so in die HubSpot-Property `bewerbung_ausbildungsstand`.
 * Wer hier etwas aendert, aendert auch die Dropdown-Optionen in HubSpot
 * (docs/hubspot-bewerbung-aerzte.md).
 */
export const AUSBILDUNGSSTAND_OPTIONEN = [
  { value: "in_weiterbildung", label: "In Facharztweiterbildung" },
  { value: "facharzt", label: "Facharzt / Fachärztin" },
  {
    value: "approbiert_ohne_weiterbildung",
    label: "Approbiert, noch keine Weiterbildung begonnen",
  },
  { value: "im_studium", label: "Noch im Studium / Praktisches Jahr" },
  { value: "sonstiges", label: "Sonstiges" },
] as const;

export type AusbildungsstandWert =
  (typeof AUSBILDUNGSSTAND_OPTIONEN)[number]["value"];

export const AUSBILDUNGSSTAND_WERTE: readonly string[] =
  AUSBILDUNGSSTAND_OPTIONEN.map((option) => option.value);

export function ausbildungsstandLabel(value: string): string {
  return (
    AUSBILDUNGSSTAND_OPTIONEN.find((option) => option.value === value)?.label ??
    value
  );
}

/**
 * Steht im Standort-Dropdown ueber den Lounges: Wer flexibel ist, soll sich
 * nicht auf einen Standort festlegen muessen, nur weil das Feld Pflicht ist.
 */
export const WUNSCHSTANDORT_FLEXIBEL = "Ortsunabhängig / flexibel";

/** Laenge des freien Nachrichtenfeldes — HubSpot-Notiz und Formular gleich. */
export const BEWERBUNG_MAX_NACHRICHT = 2000;

/** Maximale Groesse des Lebenslaufs. Vercel deckelt Request-Bodies bei 4,5 MB. */
export const CV_MAX_BYTES = 4 * 1024 * 1024;

export const CV_ERLAUBTE_ENDUNGEN = [".pdf", ".doc", ".docx"] as const;

export const CV_ERLAUBTE_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
