import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ADS_CHOOSER_CATEGORIES,
  adsChooserLocations,
  adsChooserRedirectTarget,
  adsChooserTreatments,
} from "./adsChooser.ts";
import { ADS_TEMPLATE_V2_LOCATIONS, ADS_TEMPLATE_V2_TREATMENTS } from "./adsTemplateV2.ts";
import { adsV2Terms } from "./adsTemplateV2Content.ts";

test("Startseite, /behandlungen und /standorte auf die Auswahl", () => {
  for (const p of ["/", "/behandlungen", "/standorte"]) {
    assert.equal(adsChooserRedirectTarget(p), "/standort-waehlen", p);
  }
});

test("Behandlung ohne Stadt -> Standortauswahl der Behandlung", () => {
  assert.equal(adsChooserRedirectTarget("/behandlungen/muskelrelaxans"), "/standort-waehlen/muskelrelaxans");
  assert.equal(
    adsChooserRedirectTarget("/behandlungen/muskelrelaxans/stirnfalte"),
    "/standort-waehlen/muskelrelaxans/stirnfalte",
  );
  // -rabatt-Adresse auf die Grundbehandlung
  assert.equal(
    adsChooserRedirectTarget("/behandlungen/muskelrelaxans/lachfalten-rabatt"),
    "/standort-waehlen/muskelrelaxans/lachfalten",
  );
  // Behandlung ohne v2-Seite -> Kategorie
  assert.equal(
    adsChooserRedirectTarget("/behandlungen/muskelrelaxans/baby-muskelrelaxans"),
    "/standort-waehlen/muskelrelaxans",
  );
});

test("Standort ohne Behandlung -> Behandlungsauswahl am Standort", () => {
  assert.equal(
    adsChooserRedirectTarget("/standorte/koeln/koeln-arcaden"),
    "/behandlung-waehlen/koeln/koeln-arcaden",
  );
  assert.equal(
    adsChooserRedirectTarget("/standorte/koeln/koeln-arcaden/hyaluron"),
    "/behandlung-waehlen/koeln/koeln-arcaden/hyaluron",
  );
  // Stadt mit genau einem v2-Standort
  assert.equal(adsChooserRedirectTarget("/standorte/berlin"), "/behandlung-waehlen/berlin/gesundbrunnencenter");
});

test("Bleibt: v2-Seiten, Fettwegspritze, fremde Standorte, Rechtliches, Sprachen", () => {
  for (const p of [
    "/standorte/koeln/koeln-arcaden/hyaluron/lippen-aufspritzen",
    "/behandlungen/fettwegspritze",
    "/behandlungen/fettwegspritze/doppelkinn",
    "/standorte/koeln/koeln-arcaden/fettwegspritze",
    "/standorte/wuppertal/city-arkaden",
    "/standorte/wuppertal",
    "/preise",
    "/p/impressum",
    "/en",
    "/en/treatments",
    "/standort-waehlen",
    "/behandlung-waehlen/koeln/koeln-arcaden",
  ]) {
    assert.equal(adsChooserRedirectTarget(p), null, p);
  }
});

test("Jede Auswahl-Behandlung hat einen Namen und eine Kategorie", () => {
  const cats = new Set(ADS_CHOOSER_CATEGORIES.map((c) => c.key));
  for (const key of ADS_TEMPLATE_V2_TREATMENTS) {
    assert.ok(cats.has(key.split("/")[0]!), key);
    assert.ok(adsV2Terms(key)?.label, key);
  }
  const listed = ADS_CHOOSER_CATEGORIES.flatMap((c) => adsChooserTreatments(c.key));
  assert.equal(listed.length, ADS_TEMPLATE_V2_TREATMENTS.length);
});

test("Jeder v2-Standort hat einen Anzeigenamen", () => {
  const locs = adsChooserLocations();
  assert.equal(locs.length, ADS_TEMPLATE_V2_LOCATIONS.length);
  // Kein Rueckfall auf den Slug ("hoefe-am-bruehl")
  for (const l of locs) assert.notEqual(l.name, l.key.split("/")[1], l.key);
});

test("Keine Markennamen in Namen und Zielen", () => {
  const all = [
    ...adsChooserLocations().map((l) => `${l.city} ${l.name}`),
    ...ADS_TEMPLATE_V2_TREATMENTS.map((k) => adsV2Terms(k)?.label ?? ""),
  ].join(" ");
  assert.doesNotMatch(all, /botox|botulinum|btx|MYH&B/i);
});
