/**
 * Startguthaben auf /aktion/<slug> (myhb-app/myhb-os#2188).
 * Laeuft mit `npm run test:unit`.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  istAktionsseite,
  parseStartguthaben,
  STARTGUTHABEN_BETRAEGE,
  STARTGUTHABEN_KEY,
  startguthabenFuerSeite,
  startguthabenOffer,
  startguthabenTexte,
} from "./startguthaben.ts";

function speicher(start: Record<string, string> = {}) {
  const daten = new Map(Object.entries(start));
  return {
    daten,
    getItem: (k: string) => daten.get(k) ?? null,
    setItem: (k: string, v: string) => void daten.set(k, v),
  };
}

test("nur 50 und 100 sind erlaubt", () => {
  assert.deepEqual([...STARTGUTHABEN_BETRAEGE], [50, 100]);
  assert.equal(parseStartguthaben("50"), 50);
  assert.equal(parseStartguthaben("100"), 100);
  assert.equal(parseStartguthaben(" 50 "), 50);
});

test("unbekannte Werte werden ignoriert", () => {
  for (const v of ["500", "20", "0", "-50", "50.0", "050", "50€", "gh50", "", "abc", "1e2"]) {
    assert.equal(parseStartguthaben(v), null, v);
  }
  assert.equal(parseStartguthaben(undefined), null);
  assert.equal(parseStartguthaben(null), null);
  assert.equal(parseStartguthaben(50), null);
  assert.equal(parseStartguthaben(["50"]), null);
});

test("Kennung fuer die App", () => {
  assert.equal(startguthabenOffer(50), "gh50");
  assert.equal(startguthabenOffer(100), "gh100");
});

test("wirkt nur auf /aktion/<slug>", () => {
  assert.equal(istAktionsseite("/aktion/botox"), true);
  assert.equal(istAktionsseite("/aktion/lippen/"), true);
  assert.equal(istAktionsseite("/aktion"), false);
  assert.equal(istAktionsseite("/aktion/botox/mehr"), false);
  assert.equal(istAktionsseite("/standorte/koeln/x/botox"), false);
  assert.equal(istAktionsseite("/"), false);
  assert.equal(istAktionsseite(undefined), false);
  // Andere Seite mit ?gh=: nichts, und nichts gemerkt.
  const s = speicher();
  assert.equal(startguthabenFuerSeite("/behandlungen/botox", "?gh=50", s), null);
  assert.equal(s.daten.size, 0);
  // Gemerkter Wert wirkt auf anderen Seiten nicht.
  assert.equal(startguthabenFuerSeite("/", "", speicher({ [STARTGUTHABEN_KEY]: "50" })), null);
});

test("gueltiger Parameter gilt und wird gemerkt", () => {
  const s = speicher();
  assert.equal(startguthabenFuerSeite("/aktion/botox", "?gh=50", s), 50);
  assert.equal(s.daten.get(STARTGUTHABEN_KEY), "50");
  // Spaeter in derselben Sitzung ohne Parameter: gemerkter Wert.
  assert.equal(startguthabenFuerSeite("/aktion/lippen", "", s), 50);
  // Neuer gueltiger Wert ersetzt den alten.
  assert.equal(startguthabenFuerSeite("/aktion/botox", "?utm_source=fb&gh=100", s), 100);
  assert.equal(s.daten.get(STARTGUTHABEN_KEY), "100");
});

test("ohne Parameter und ohne gemerkten Wert: nichts", () => {
  assert.equal(startguthabenFuerSeite("/aktion/botox", "", speicher()), null);
  assert.equal(startguthabenFuerSeite("/aktion/botox", "?utm_source=fb", null), null);
});

test("unbekannter Parameter aendert nichts", () => {
  const leer = speicher();
  assert.equal(startguthabenFuerSeite("/aktion/botox", "?gh=500", leer), null);
  assert.equal(leer.daten.size, 0);
  const gemerkt = speicher({ [STARTGUTHABEN_KEY]: "100" });
  assert.equal(startguthabenFuerSeite("/aktion/botox", "?gh=500", gemerkt), 100);
  assert.equal(gemerkt.daten.get(STARTGUTHABEN_KEY), "100");
  // Manipulierter Speicher wird auch ignoriert.
  assert.equal(startguthabenFuerSeite("/aktion/botox", "", speicher({ [STARTGUTHABEN_KEY]: "500" })), null);
});

test("gesperrter Speicher (Safari privat) bricht nichts", () => {
  const kaputt = {
    getItem: () => {
      throw new Error("SecurityError");
    },
    setItem: () => {
      throw new Error("SecurityError");
    },
  };
  assert.equal(startguthabenFuerSeite("/aktion/botox", "?gh=100", kaputt), 100);
  assert.equal(startguthabenFuerSeite("/aktion/botox", "", kaputt), null);
});

test("Texte: Betrag, erste Behandlung, Fussnote, Sprache", () => {
  const t = startguthabenTexte(50);
  assert.equal(t.zeile, "50 € Startguthaben für deine erste Behandlung*");
  assert.equal(`${t.hauptteil} ${t.zusatz}`, t.zeile);
  assert.equal(
    t.fussnote,
    "*50 € Startguthaben für deine erste Behandlung. Gilt für Neukunden bei Buchung über diese Seite. " +
      "Das Guthaben steht nach der Buchung automatisch in deinem Kundenkonto, ist 60 Tage gültig " +
      "und deckt höchstens die Hälfte des Rechnungsbetrags.",
  );
  assert.match(startguthabenTexte(100).zeile, /^100 € Startguthaben/);
  for (const b of STARTGUTHABEN_BETRAEGE) {
    const alle = Object.values(startguthabenTexte(b))
      .map((v) => (typeof v === "function" ? v("Botox") : v))
      .join(" ");
    assert.doesNotMatch(alle, /Kundin|Neukundenangebot|Rabatt|%|\bSie\b|MYH&B/);
  }
});
