import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CLUB,
  SPARBUCH_PFLICHTSATZ,
  STUFEN,
  appUrl,
  isClubSeitenEnabled,
  prozent,
  sparbuchBeispiel,
} from "./clubSeiten.ts";

test("Schalter: nur ausdruecklich an", () => {
  for (const an of ["on", "1", "true", "YES"]) assert.equal(isClubSeitenEnabled(an), true);
  for (const aus of [undefined, "", "off", "0", "nein"]) assert.equal(isClubSeitenEnabled(aus), false);
});

test("App-Link traegt Ort und Kampagne", () => {
  const url = new URL(appUrl("footer", "sparbuch"));
  assert.equal(url.searchParams.get("utm_medium"), "footer");
  assert.equal(url.searchParams.get("utm_campaign"), "sparbuch");
});

test("Stufen steigen", () => {
  for (let i = 1; i < STUFEN.length; i++) {
    assert.ok((STUFEN[i]!.ab ?? 0) > (STUFEN[i - 1]!.ab ?? 0));
    assert.ok(STUFEN[i]!.sparbuchBonusProzent >= STUFEN[i - 1]!.sparbuchBonusProzent);
  }
});

test("Cashback: Basic 1 % wie heute, White 1,5 % (Benjamin 21.10.2026)", () => {
  assert.deepEqual(STUFEN.map((s) => s.cashbackProzent), [1, 1.5, 2, 3]);
  assert.equal(prozent(1.5), "1,5 %");
});

test("Rechenbeispiel 50 € x 12 Monate", () => {
  // 50·(1+…+12) = 3.900 €·Monat; × 6 %/12 = 19,50 €
  assert.deepEqual(sparbuchBeispiel(6), { eingezahlt: 600, bonus: 19.5 });
});

test("Sparbuch-Texte: keine verbotenen Woerter (Konzept Kap. 3)", () => {
  const texte = [
    readFileSync(new URL("../app/pages/beauty-sparbuch.vue", import.meta.url), "utf8"),
    readFileSync(new URL("../app/pages/club.vue", import.meta.url), "utf8"),
  ].join("\n");
  // Kommentare und der Pflichtsatz ("Kein Bankprodukt") zaehlen nicht.
  const sichtbar = texte
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/Kein Bankprodukt/g, "")
    .replace(/Einlagensicherung/g, "");
  for (const wort of [/Zins/i, /Rendite/i, /Einlage/i, /Beauty[ -]?Bank/i, /Kundin/]) {
    assert.doesNotMatch(sichtbar, wort);
  }
  assert.match(SPARBUCH_PFLICHTSATZ, /Nicht auszahlbar/);
});

test("Regeln vom 23.10.2026: Bonus 36 Monate, Wunscharzt ab WHITE, Namen in Versalien", () => {
  assert.equal(CLUB.bonusGueltigMonate, 36);
  assert.equal(CLUB.verfallOhneBesuchMonate, 36);
  assert.deepEqual(STUFEN.map((s) => s.wunscharzt), [false, true, true, true]);
  assert.deepEqual(STUFEN.map((s) => s.name), ["BASIC", "WHITE", "GREY", "BLACK"]);
});

test("Club-Seite nennt den Geburtstagsbonus nicht (Ueberraschung, Benjamin 23.10.2026)", () => {
  const club = readFileSync(new URL("../app/pages/club.vue", import.meta.url), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  assert.doesNotMatch(club, /geburtstagEuro|Geburtstag/);
});
