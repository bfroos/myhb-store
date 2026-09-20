/**
 * Anbieter-Abstraktion der Hautanalyse (E19 #251).
 *
 * Warum diese Schicht existiert: Die Messung ist Massenware. Gemessen am
 * 19.09.2026 liegen die veroeffentlichten Preise zwischen 0,51 EUR
 * (Perfect Corp, 5–8 Merkmale) und 0,90 USD (AILabTools "Skin Analyze Pro").
 * Kein Anbieter ist es wert, dass sein Feldschema bis in die Ergebnisseite
 * durchschlaegt — der Wettbewerber Kalia Lab haengt genau so an AILabTools.
 * Alles hinter dieser Datei spricht unsere eigenen Merkmalsnamen aus
 * `#shared/hautanalyse`.
 *
 * Welcher Anbieter laeuft, steuert `NUXT_HAUTANALYSE_ANBIETER`. Voreinstellung
 * ist `stub` — also **kein** Bild verlaesst den Server. Das ist Absicht: Es gibt
 * fuer keinen Anbieter einen Auftragsverarbeitungsvertrag, und ohne den darf
 * hier kein Gesicht hinausgehen (docs/hautanalyse-recht.md, #252).
 */
import type { HautanalyseErgebnis } from "#shared/hautanalyse";

export interface Anbieter {
  name: string;
  /**
   * Bekommt das Selfie als Rohbytes und gibt unser normalisiertes Ergebnis
   * zurueck. Speichert nichts — weder hier noch beim Anbieter laenger als fuer
   * die Antwort noetig.
   */
  analysiere(bild: Uint8Array): Promise<HautanalyseErgebnis>;
}

export class AnbieterFehler extends Error {
  constructor(
    message: string,
    readonly statusCode = 502,
  ) {
    super(message);
  }
}

/**
 * Waehlt den Anbieter. Neue Anbieter kommen hier dazu; die Seite und die Route
 * aendern sich dabei nicht.
 */
export async function anbieterAuswaehlen(): Promise<Anbieter> {
  const gewaehlt = (process.env.NUXT_HAUTANALYSE_ANBIETER || "stub").trim();

  switch (gewaehlt) {
    case "ailabtools": {
      const { ailabtoolsAnbieter } = await import("./ailabtools");
      return ailabtoolsAnbieter();
    }
    case "stub": {
      const { stubAnbieter } = await import("./stub");
      return stubAnbieter();
    }
    default:
      throw new AnbieterFehler(
        `Unbekannter Hautanalyse-Anbieter: ${gewaehlt}`,
        500,
      );
  }
}
