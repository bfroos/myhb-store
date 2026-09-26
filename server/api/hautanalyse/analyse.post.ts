/**
 * Nimmt das Selfie entgegen, gibt Merkmalswerte zurueck (#136, E19 #251).
 *
 * Die Route ist die einzige Stelle, an der das Bild ueberhaupt existiert. Sie
 * schreibt es nirgendwo hin: keine Datei, keine Datenbank, kein Log. Nach der
 * Antwort ist es weg — das ist die technische Seite der Zusage aus
 * docs/hautanalyse-recht.md ("Bild wird nicht gespeichert").
 *
 * Ohne Einwilligung und Altersbestaetigung verlaesst nichts diese Funktion.
 * Der Riegel liegt bewusst **hier** und nicht nur im Formular: eine Checkbox im
 * Browser ist keine Zugangskontrolle.
 */
import { anbieterAuswaehlen, AnbieterFehler } from "~~/server/utils/hautanalyse/anbieter";

/** Grosszuegig fuer ein 1080er-JPEG, zu klein fuer einen Upload-Missbrauch. */
const MAX_BYTES = 6 * 1024 * 1024;

const ERLAUBTE_TYPEN = ["image/jpeg", "image/png", "image/webp"];

interface Anfrage {
  bild?: string;
  einwilligung?: boolean;
  volljaehrig?: boolean;
}

export default defineEventHandler(async (event) => {
  const koerper = await readBody<Anfrage>(event);

  if (!koerper?.einwilligung || !koerper?.volljaehrig) {
    throw createError({
      statusCode: 400,
      statusMessage: "Ohne Einwilligung und Altersbestätigung keine Analyse",
    });
  }

  const treffer = /^data:([^;,]+);base64,(.+)$/s.exec(koerper.bild ?? "");
  if (!treffer) {
    throw createError({ statusCode: 400, statusMessage: "Kein Bild empfangen" });
  }

  const [, typ, base64] = treffer;
  if (!ERLAUBTE_TYPEN.includes(typ!)) {
    throw createError({ statusCode: 415, statusMessage: "Bildformat nicht unterstützt" });
  }

  const bild = Buffer.from(base64!, "base64");
  if (!bild.length || bild.length > MAX_BYTES) {
    throw createError({ statusCode: 413, statusMessage: "Bild zu groß" });
  }

  try {
    const anbieter = await anbieterAuswaehlen();
    return await anbieter.analysiere(new Uint8Array(bild));
  } catch (fehler) {
    // Eigener Text fuer die Nutzerin, Rohmeldung nur in die Konsole — dieselbe
    // Regel wie in der App (src/lib/errorText.ts in elanagency/myhb-os).
    console.error("[hautanalyse] Analyse fehlgeschlagen:", fehler);
    if (fehler instanceof AnbieterFehler) {
      throw createError({
        statusCode: fehler.statusCode,
        statusMessage:
          fehler.statusCode === 429
            ? "Gerade sind viele Analysen unterwegs. Bitte in einer Minute noch einmal."
            : "Die Analyse hat nicht geklappt. Bitte versuch es noch einmal.",
      });
    }
    throw createError({
      statusCode: 502,
      statusMessage: "Die Analyse hat nicht geklappt. Bitte versuch es noch einmal.",
    });
  }
});
