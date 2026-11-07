/**
 * Startguthaben auf den Meta-Seiten /aktion/<slug> (myhb-app/myhb-os#2188,
 * Meta-Test 50 € gegen 100 € #2187). Vorbereitet, Freigabe durch Michael offen.
 *
 * Nur wenn die Seite mit `?gh=50` oder `?gh=100` aufgerufen wird: Statt des
 * 20-%-Angebots wirbt sie mit dem Startguthaben, und die Buchung geht mit
 * `offer=gh50` bzw. `offer=gh100` (statt `nk20`) an die App. Die App schreibt
 * Neukunden das Guthaben dann selbst ins Konto (60 Tage gültig, deckt an der
 * Kasse höchstens die Hälfte des Bons, Bestandskunden bekommen nichts).
 *
 * Der Wert wird in der Sitzung gemerkt (sessionStorage), wirkt aber nur auf
 * /aktion/<slug>. Jede andere Seite, go.* und Google bleiben unverändert.
 * Unbekannte Werte (z. B. `gh=500`) werden ignoriert.
 *
 * Reine Funktionen ohne Browserzugriff, damit sie im Unit-Test laufen.
 */

/** Erlaubte Beträge in Euro. Die App nimmt nur diese an (#2188). */
export const STARTGUTHABEN_BETRAEGE = [50, 100] as const;
export type StartguthabenBetrag = (typeof STARTGUTHABEN_BETRAEGE)[number];

/** Gültigkeit in Tagen, wie in der App. */
export const STARTGUTHABEN_TAGE = 60;

/** URL-Parameter der Seite. */
export const STARTGUTHABEN_PARAM = "gh";

/** Schlüssel im sessionStorage. */
export const STARTGUTHABEN_KEY = "myhb_startguthaben";

/** "50" oder "100" (genau so), sonst `null`. */
export function parseStartguthaben(raw: unknown): StartguthabenBetrag | null {
  if (typeof raw !== "string") return null;
  const wert = raw.trim();
  if (!/^\d+$/.test(wert)) return null;
  const zahl = Number(wert);
  return (STARTGUTHABEN_BETRAEGE as readonly number[]).includes(zahl) && String(zahl) === wert
    ? (zahl as StartguthabenBetrag)
    : null;
}

/** Kennung für die App-Buchungs-URL: `gh50` / `gh100`. */
export function startguthabenOffer(betrag: StartguthabenBetrag): `gh${StartguthabenBetrag}` {
  return `gh${betrag}`;
}

/** Nur die Meta-Seiten /aktion/<slug> (auch mit Schrägstrich am Ende). */
export function istAktionsseite(pfad: string | null | undefined): boolean {
  return /^\/aktion\/[^/]+\/?$/.test(String(pfad ?? ""));
}

type Speicher = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

/**
 * Startguthaben für diese Seite. Ein gültiger `?gh=` wird gemerkt und gilt;
 * ohne (oder mit unbekanntem) Parameter gilt der gemerkte Wert der Sitzung.
 * Außerhalb von /aktion/<slug> immer `null`.
 */
export function startguthabenFuerSeite(
  pfad: string | null | undefined,
  suche: string | null | undefined,
  speicher?: Speicher | null,
): StartguthabenBetrag | null {
  if (!istAktionsseite(pfad)) return null;
  let ausUrl: StartguthabenBetrag | null = null;
  try {
    ausUrl = parseStartguthaben(new URLSearchParams(suche ?? "").get(STARTGUTHABEN_PARAM) ?? undefined);
  } catch {}
  if (ausUrl) {
    try {
      speicher?.setItem(STARTGUTHABEN_KEY, String(ausUrl));
    } catch {}
    return ausUrl;
  }
  try {
    return parseStartguthaben(speicher?.getItem(STARTGUTHABEN_KEY) ?? undefined);
  } catch {
    return null;
  }
}

export type StartguthabenTexte = {
  /** Hero, mitlaufende Leiste, Aufrufe: "50 € Startguthaben für deine erste Behandlung*". */
  zeile: string;
  /** Hero, groß und ohne Umbruch: "50 € Startguthaben". */
  hauptteil: string;
  /** Hero, kleiner daneben: "für deine erste Behandlung*". */
  zusatz: string;
  /** Hauptknopf. */
  knopf: string;
  /** Knopf in der mitlaufenden Leiste (kurz). */
  knopfKurz: string;
  /** Fußnote am Seitenende. */
  fussnote: string;
  /** Seitentitel. */
  titel: (behandlung: string) => string;
};

export function startguthabenTexte(betrag: StartguthabenBetrag): StartguthabenTexte {
  const euro = `${betrag} €`;
  return {
    zeile: `${euro} Startguthaben für deine erste Behandlung*`,
    hauptteil: `${euro} Startguthaben`,
    zusatz: "für deine erste Behandlung*",
    knopf: `${euro} Startguthaben sichern`,
    knopfKurz: `${euro} sichern`,
    fussnote:
      `*${euro} Startguthaben für deine erste Behandlung. Gilt für Neukunden bei Buchung über diese Seite. ` +
      `Das Guthaben steht nach der Buchung automatisch in deinem Kundenkonto, ist ${STARTGUTHABEN_TAGE} Tage gültig ` +
      "und deckt höchstens die Hälfte des Rechnungsbetrags.",
    titel: (behandlung) => `${behandlung} – ${euro} Startguthaben für deine erste Behandlung`,
  };
}
