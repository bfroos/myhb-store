import { test } from "node:test";
import assert from "node:assert/strict";
import { SEO_CITY_LIPPEN } from "./seoPilotLippen.ts";
import {
  applyLocalFacts,
  factsSourceSentence,
  languagesSentence,
  type LocalFactsDto,
} from "./localFacts.ts";

/** So stehen Köln und Düsseldorf seit 19.10.2026 in Strapi (localFacts, de). */
export const STRAPI_FACTS: Record<string, LocalFactsDto> = {
  "koeln/koeln-arcaden": {
    district: "Kalk",
    placeInCenter: "Ebene −1, zwischen dm und Apollo Optik",
    wayInCenter:
      "Im Center auf Ebene −1 (Untergeschoss) fahren – per Rolltreppe oder Aufzug.\nUnsere Lounge liegt zwischen dm und Apollo Optik. Du erkennst uns am hellen Empfang mit dem MY-Logo.",
    parking:
      "1.800 Parkplätze, rund um die Uhr geöffnet, ohne Ticket (Kennzeichenerkennung)\n1. und 2. Stunde je 1,00 €, ab der 3. Stunde 1,50 € (bei hoher Auslastung 1,50 € je Stunde), höchstens 10,00 € am Tag\nLadestationen für E-Autos neben der Einfahrt P2",
    accessibility:
      "Vom Parkhaus kommst du barrierefrei ins Center, Aufzüge fahren auf jede Ebene. Die Haltestelle Kalk Post ist barrierefrei.",
    serviceAreaText:
      "Zu uns kommen Kundinnen aus ganz Köln und dem rechtsrheinischen Umland – viele ohne Umsteigen:",
    serviceArea:
      "Kalk\nDeutz (Linie 1 und 9)\nVingst und Höhenberg\nBergisch Gladbach-Refrath und Bensberg (Linie 1)\nPorz (S12)\nRösrath (RB 25)\nTroisdorf und Siegburg (S12, S19)",
    languages: "Deutsch, Englisch",
    factsSource: "Parken und Linien laut Köln Arcaden",
    checkedAt: "2026-10-12",
  },
  "duesseldorf/duesseldorf-arcaden": {
    district: "Bilk",
    placeInCenter: "Ebene −1, gegenüber von ALDI",
    wayInCenter:
      "Im Center auf Ebene −1 (Untergeschoss) – Rolltreppen und Aufzüge sind vorhanden.\nUnsere Lounge liegt direkt gegenüber von ALDI.",
    parking:
      "Über 800 Parkplätze, davon 18 für Menschen mit Behinderung, Einfahrthöhe höchstens 2 m\nJede angefangene Stunde 1,60 €, höchstens 13,00 € am Tag\nEinfahrt montags bis samstags 5:30–22 Uhr, Ausfahrt jederzeit",
    accessibility:
      "Das Center ist barrierefrei, Aufzüge verbinden alle Ebenen. Am Bahnhof Bilk gibt es Aufzüge zu den Gleisen.",
    serviceAreaText:
      "Zu uns kommen Kundinnen aus ganz Düsseldorf und vom linken Niederrhein – viele ohne Umsteigen:",
    serviceArea:
      "Bilk, Unterbilk und Friedrichstadt\nOberbilk und Medienhafen\nVolmerswerth und Flehe (U71, U83)\nHolthausen und Benrath (U72)\nOberkassel (Bus 835, 836)\nNeuss (S8, S11, S28)\nKaarst (S28) und Dormagen (S11)",
    languages: "Deutsch, Englisch",
    factsSource: "Parken und Linien laut Düsseldorf Arcaden",
    checkedAt: "2026-10-12",
  },
};

test("Strapi-Fakten ergeben fuer den Pilot exakt den bisherigen Text", () => {
  for (const [key, facts] of Object.entries(STRAPI_FACTS)) {
    const code = SEO_CITY_LIPPEN[key];
    assert.ok(code, key);
    assert.deepEqual(applyLocalFacts(code, facts), code, key);
  }
});

test("ohne Fakten oder mit leeren Feldern bleibt der Code-Text", () => {
  const code = SEO_CITY_LIPPEN["koeln/koeln-arcaden"];
  assert.equal(applyLocalFacts(code, null), code);
  assert.deepEqual(applyLocalFacts(code, { district: " ", parking: "", serviceArea: null }), code);
});

test("Strapi gewinnt, wo gepflegt", () => {
  const code = SEO_CITY_LIPPEN["koeln/koeln-arcaden"];
  const out = applyLocalFacts(code, { languages: "Deutsch, Englisch, Türkisch", parking: "A\n\nB" });
  assert.equal(out.languages, "Im Team sprechen wir Deutsch, Englisch und Türkisch.");
  assert.deepEqual(out.parking, ["A", "B"]);
  assert.equal(out.district, code.district);
});

test("Einzugsgebiet kommagetrennt, wenn einzeilig", () => {
  const code = SEO_CITY_LIPPEN["koeln/koeln-arcaden"];
  assert.deepEqual(applyLocalFacts(code, { serviceArea: "Kalk, Deutz ,Porz" }).serviceArea, ["Kalk", "Deutz", "Porz"]);
});

test("Saetze fuer Sprachen und Quelle", () => {
  assert.equal(languagesSentence("Deutsch"), "Im Team sprechen wir Deutsch.");
  assert.equal(factsSourceSentence("Laut Center", null), "Laut Center. Angaben ohne Gewähr.");
  assert.equal(factsSourceSentence("Eigener Satz.", "2026-03-01"), "Eigener Satz.");
  assert.equal(factsSourceSentence("Laut Center", "2026-03-01"), "Laut Center, Stand März 2026. Angaben ohne Gewähr.");
});
