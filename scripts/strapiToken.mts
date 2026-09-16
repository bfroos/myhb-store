/**
 * Holt den Strapi-Schreibtoken -- ohne dass er in der Kommandozeile steht.
 *
 * Reihenfolge:
 *   1. STRAPI_TOKEN aus der Umgebung
 *   2. STRAPI_TOKEN_FILE (Pfad zu einer Datei, die nur den Token enthaelt)
 *   3. Nachfrage im Terminal
 *
 * Hintergrund: Ein Aufruf der Form `STRAPI_TOKEN=<wert> npx tsx ...` laedt zum
 * Copy-Paste-Fehler ein -- zsh liest `<wert>` als Umleitung und bricht mit
 * "no such file or directory" ab, und ein woertlich uebernommener Platzhalter
 * laeuft in 401. Beides ist hier passiert. Deshalb fragt das Skript selbst.
 */

import { createInterface } from "node:readline/promises";
import { readFileSync } from "node:fs";

export async function ladeToken(): Promise<string> {
  const ausUmgebung = (process.env.STRAPI_TOKEN ?? "").trim();
  if (ausUmgebung) return ausUmgebung;

  const datei = (process.env.STRAPI_TOKEN_FILE ?? "").trim();
  if (datei) {
    try {
      const wert = readFileSync(datei.replace(/^~/, process.env.HOME ?? "~"), "utf8").trim();
      if (wert) return wert;
      console.error(`STRAPI_TOKEN_FILE zeigt auf eine leere Datei: ${datei}`);
      process.exit(1);
    } catch (err) {
      console.error(`STRAPI_TOKEN_FILE nicht lesbar: ${(err as Error).message}`);
      process.exit(1);
    }
  }

  if (!process.stdin.isTTY) {
    console.error(
      "Kein Token gefunden und kein Terminal zum Nachfragen.\n" +
        "Setze STRAPI_TOKEN oder STRAPI_TOKEN_FILE.",
    );
    process.exit(1);
  }

  console.log("Strapi-Token wird gebraucht (Admin -> Einstellungen -> API-Tokens).");
  console.log("Die Eingabe bleibt unsichtbar -- einfach einfuegen und Enter druecken.\n");

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
  const antwort = rl.question("Token: ");
  // Echo abschalten, damit der Token nicht im Scrollback stehen bleibt.
  (rl as unknown as { _writeToOutput: (s: string) => void })._writeToOutput = () => {};
  const token = (await antwort).trim();
  rl.close();
  process.stdout.write("\n");

  if (!token) {
    console.error("Kein Token eingegeben -- abgebrochen.");
    process.exit(1);
  }
  return token;
}
