/**
 * Adapter fuer AILabTools "Skin Analyze Pro" (www.ailabapi.com).
 *
 * ACHTUNG — dieser Anbieter ist **nicht freigegeben**. Er steht hier aus zwei
 * Gruenden, und beide sind keine Empfehlung:
 *
 * 1. Er beweist, dass die Abstraktion in `anbieter.ts` traegt: ein echter
 *    Anbieter mit echtem Feldschema, angebunden ohne eine Zeile in der Seite
 *    zu aendern.
 * 2. Das Feldschema ist belegt statt geraten. Es stammt aus der Messung des
 *    Wettbewerbers Kalia Lab am 19.09.2026 (skinscanner.kalialab.de laeuft
 *    darauf) und aus der Anbieterdokumentation.
 *
 * Warum er trotzdem aus bleibt: Betreiber ist die AI Innovate Technology
 * Limited in Hongkong. Es gibt keinen Auftragsverarbeitungsvertrag, keinen
 * dokumentierten EU-Verarbeitungsort und keine Zusage zur Loeschung des
 * Bildes. Fuer Gesundheitsdaten nach Art. 9 DSGVO ist das drei Mal zu wenig
 * (docs/hautanalyse-recht.md, elanagency/myhb-os#252). Wer
 * `NUXT_HAUTANALYSE_ANBIETER=ailabtools` setzt, uebermittelt Gesichter in ein
 * Drittland — das ist eine Entscheidung fuer Benjamin und den Anwalt, nicht
 * fuer eine Umgebungsvariable.
 *
 * Unbestaetigt bleibt die Richtung der Punktwerte: die Dokumentation sagt
 * nicht ausdruecklich, dass `*_score` "hoeher ist besser" bedeutet. Vor einem
 * echten Einsatz an zwei, drei Bildern gegenpruefen.
 */
import type { HautanalyseErgebnis, MerkmalKey } from "#shared/hautanalyse";
import { AnbieterFehler, type Anbieter } from "./anbieter";

const ENDPUNKT = "https://www.ailabapi.com/api/portrait/analysis/skin-analysis-pro";

/** Unsere Merkmale <- deren `score_info`-Felder. */
const SCORE_FELDER: Record<MerkmalKey, string> = {
  falten: "wrinkle_score",
  augenringe: "dark_circle_score",
  feuchtigkeit: "water_score",
  poren: "pores_score",
  textur: "rough_score",
  pigment: "melanin_score",
  roetung: "sensitivity_score",
  fettigkeit: "oily_intensity_score",
};

/** Deren Falschfarben-Karten <- unsere Merkmale. */
const KARTEN_FELDER: Partial<Record<MerkmalKey, string>> = {
  falten: "texture_enhanced_lines",
  poren: "texture_enhanced_pores",
  pigment: "brown_area",
  roetung: "red_area",
  feuchtigkeit: "water_area",
  textur: "rough_area",
  fettigkeit: "texture_enhanced_oily_area",
};

function zahl(wert: unknown): number | null {
  const n = typeof wert === "string" ? Number(wert) : wert;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

export function ailabtoolsAnbieter(): Anbieter {
  const schluessel = process.env.NUXT_HAUTANALYSE_AILABTOOLS_KEY?.trim();
  if (!schluessel) {
    throw new AnbieterFehler(
      "NUXT_HAUTANALYSE_AILABTOOLS_KEY fehlt — Anbieter nicht konfiguriert",
      500,
    );
  }

  return {
    name: "AILabTools Skin Analyze Pro",
    async analysiere(bild) {
      const formular = new FormData();
      formular.append("image", new Blob([bild as BlobPart]), "selfie.jpg");
      formular.append("return_maps", Object.values(KARTEN_FELDER).join(","));

      const antwort = await fetch(ENDPUNKT, {
        method: "POST",
        headers: { "ailabapi-api-key": schluessel },
        body: formular,
      });

      if (!antwort.ok) {
        throw new AnbieterFehler(
          `Anbieter antwortete mit ${antwort.status}`,
          antwort.status === 429 ? 429 : 502,
        );
      }

      const daten = (await antwort.json()) as {
        result?: {
          skin_age?: { value?: unknown };
          score_info?: Record<string, unknown>;
          face_maps?: Record<string, string>;
        };
      };
      const ergebnisTeil = daten.result;
      if (!ergebnisTeil?.score_info) {
        throw new AnbieterFehler("Anbieter lieferte keine Messwerte");
      }

      const merkmale = (Object.keys(SCORE_FELDER) as MerkmalKey[])
        .map((key) => ({
          key,
          wert: zahl(ergebnisTeil.score_info?.[SCORE_FELDER[key]]),
        }))
        .filter((m): m is { key: MerkmalKey; wert: number } => m.wert !== null)
        .map((m) => ({ key: m.key, wert: Math.max(0, Math.min(100, m.wert)) }));

      const karten: HautanalyseErgebnis["karten"] = {};
      for (const [key, feld] of Object.entries(KARTEN_FELDER)) {
        const base64 = ergebnisTeil.face_maps?.[feld as string];
        if (base64) karten[key as MerkmalKey] = `data:image/png;base64,${base64}`;
      }

      return {
        hautalter: zahl(ergebnisTeil.skin_age?.value),
        merkmale,
        karten,
        quelle: "AILabTools Skin Analyze Pro",
      };
    },
  };
}
