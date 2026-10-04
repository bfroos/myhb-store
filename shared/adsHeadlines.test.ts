import { test } from "node:test";
import assert from "node:assert/strict";
import {
  adsH1,
  adsHeadlineEntries,
  adsSubline,
  isGenericSubline,
} from "./adsHeadlines.ts";

test("H1 in Suchsprache mit Stadt", () => {
  assert.equal(adsH1("muskelrelaxans/stirnfalte", "Köln"), "Stirnfalte glätten in Köln");
  assert.equal(adsH1("muskelrelaxans/zornesfalte", "Köln"), "Zornesfalte glätten in Köln");
  assert.equal(adsH1("hyaluron/lippen-aufspritzen", "Köln"), "Lippen aufspritzen in Köln");
  assert.equal(adsH1("hyaluron/nasolabialfalte", null), "Nasolabialfalte unterspritzen");
  assert.equal(adsH1("muskelrelaxans", "Berlin"), "Faltenbehandlung mit Muskelrelaxans in Berlin");
});

test("-rabatt-Variante nimmt die Grundseite", () => {
  assert.equal(adsH1("muskelrelaxans/lachfalten-rabatt", "Recklinghausen"), "Lachfalten glätten in Recklinghausen");
});

test("unbekannte Seite: kein Sondertitel", () => {
  assert.equal(adsH1("infusionen/gibt-es-nicht", "Köln"), null);
  assert.equal(adsH1(null, "Köln"), null);
});

test("kein Markenname, kurze H1, Unterzeile vorhanden", () => {
  for (const [key, entry] of adsHeadlineEntries()) {
    assert.doesNotMatch(entry.h1 + " " + entry.subline, /botox|botulinum|\bbtx\b/i, key);
    assert.ok(entry.h1.length <= 36, `${key}: H1 zu lang (${entry.h1})`);
    assert.ok(entry.subline.length > 0 && entry.subline.length <= 72, `${key}: Unterzeile`);
  }
});

test("generische Unterzeile wird ersetzt, konkrete bleibt", () => {
  assert.ok(isGenericSubline("Erfahrene Ärzte & Premium Produkte"));
  assert.ok(isGenericSubline(""));
  assert.ok(!isGenericSubline("Für eine wunderbar geformte Kieferlinie"));
  assert.equal(
    adsSubline("muskelrelaxans/stirnfalte", "Erfahrene Ärzte & Premium Produkte"),
    "Glattere Stirn in 20–30 Minuten – ärztlich, ohne Ausfallzeit",
  );
  assert.equal(
    adsSubline("hyaluron/jawline", "Für eine wunderbar geformte Kieferlinie"),
    "Für eine wunderbar geformte Kieferlinie",
  );
  assert.equal(
    adsSubline("infusionen/gibt-es-nicht", "Erfahrene Ärzte & Premium Produkte"),
    "Erfahrene Ärzte & Premium Produkte",
  );
});
