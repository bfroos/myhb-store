/**
 * Stub-Anbieter: misst nichts, verlaesst den Server nicht.
 *
 * Er existiert, damit der ganze Ablauf — Einwilligung, Aufnahme, Ergebnis,
 * Buchung — fertig gebaut und durchgeklickt werden kann, **bevor** ein Vertrag
 * mit einem Anbieter existiert. Das war die Bedingung, unter der dieser
 * Prototyp gebaut wurde: die Anbieterwahl (#251) und die Rechtsfreigabe (#252)
 * sollen den Bau nicht blockieren, und der Bau darf die beiden nicht
 * vorwegnehmen.
 *
 * Die Werte sind aus dem Bild abgeleitet, nicht zufaellig: dasselbe Foto gibt
 * dasselbe Ergebnis. Sonst waere die Seite beim Testen nicht zu beurteilen.
 * **Es ist trotzdem keine Messung** — die Ergebnisseite sagt das auch so.
 */
import type { MerkmalKey, HautanalyseErgebnis } from "#shared/hautanalyse";
import type { Anbieter } from "./anbieter";

const MERKMALE: MerkmalKey[] = [
  "falten",
  "augenringe",
  "feuchtigkeit",
  "poren",
  "textur",
  "pigment",
  "roetung",
  "fettigkeit",
];

/** Billige, stabile Streuung ueber die Bildbytes — kein Hashwert mit Anspruch. */
function streuung(bild: Uint8Array, versatz: number): number {
  let summe = versatz * 7919;
  const schritt = Math.max(1, Math.floor(bild.length / 512));
  for (let i = 0; i < bild.length; i += schritt) {
    summe = (summe * 31 + (bild[i] ?? 0)) >>> 0;
  }
  // Ohne diese Durchmischung liegen die Werte benachbarter Merkmale bei
  // kleinen Bildern eins auseinander (60, 59, 58 …) — das sieht nach Messung
  // aus, ist aber nur der Versatz.
  summe ^= summe >>> 16;
  summe = Math.imul(summe, 0x7feb352d) >>> 0;
  summe ^= summe >>> 15;
  // `^=` liefert vorzeichenbehaftete 32 Bit — ohne das `>>> 0` kommen negative
  // Werte heraus, und aus `% 61` wird ein Merkmalswert von -18.
  return summe >>> 0;
}

export function stubAnbieter(): Anbieter {
  return {
    name: "Beispielwerte (kein Anbieter angebunden)",
    async analysiere(bild) {
      const merkmale = MERKMALE.map((key, index) => ({
        key,
        // 35–95: immer mindestens ein auffaelliges Merkmal, nie alles rot.
        wert: 35 + (streuung(bild, index + 1) % 61),
      }));

      const ergebnis: HautanalyseErgebnis = {
        hautalter: 25 + (streuung(bild, 99) % 26),
        merkmale,
        quelle: "Beispielwerte (kein Anbieter angebunden)",
      };
      return ergebnis;
    },
  };
}
