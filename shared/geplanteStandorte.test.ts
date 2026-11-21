import { test } from "node:test";
import assert from "node:assert/strict";
import {
  geplanterStandortZiel,
  istIndexierbarerGeplanterStandort,
  istIndexierbareGeplanteStadt,
  istUmgeleiteterStandort,
} from "./geplanteStandorte.ts";

test("Unterseiten leiten auf dieselbe Unterseite der Ziel-Filiale", () => {
  assert.equal(geplanterStandortZiel("/standorte/bielefeld/loom/botox/masseter"), "/standorte/recklinghausen/palais-vest/botox/masseter");
  assert.equal(geplanterStandortZiel("/standorte/city/Allee-Center-Magdeburg/fettwegspritze"), "/standorte/leipzig/hoefe-am-bruehl/fettwegspritze");
  assert.equal(geplanterStandortZiel("/standorte/koblenz/loehr-center"), "/standorte/koeln/koeln-arcaden");
});

test("Großschreibung Wuppertal, Schrägstrich am Ende und Query", () => {
  assert.equal(geplanterStandortZiel("/standorte/Wuppertal/city-arkaden-wuppertal/hyaluron/", "?utm=x"), "/standorte/duesseldorf/duesseldorf-arcaden/hyaluron?utm=x");
});

test("Sprachversionen behalten Präfix", () => {
  assert.equal(geplanterStandortZiel("/en/locations/koblenz/loehr-center/botox"), "/en/locations/koeln/koeln-arcaden/botox");
});

test("Stadtseiten", () => {
  assert.equal(geplanterStandortZiel("/standorte/bielefeld"), "/standorte/recklinghausen");
  assert.equal(geplanterStandortZiel("/standorte/city"), "/standorte/leipzig");
});

test("Saarbrücken und offene Filialen bleiben unberührt", () => {
  assert.equal(geplanterStandortZiel("/standorte/saarbruecken/europa-galerie/botox"), null);
  assert.equal(geplanterStandortZiel("/standorte/koeln/koeln-arcaden/botox"), null);
  assert.equal(geplanterStandortZiel("/standorte"), null);
  assert.equal(geplanterStandortZiel("/behandlungen/botox"), null);
});

test("Hilfsfunktionen", () => {
  assert.equal(istUmgeleiteterStandort("Wuppertal", "city-arkaden-wuppertal"), true);
  assert.equal(istUmgeleiteterStandort("saarbruecken", "europa-galerie"), false);
  assert.equal(istIndexierbarerGeplanterStandort("saarbruecken", "europa-galerie"), true);
  assert.equal(istIndexierbareGeplanteStadt("saarbruecken"), true);
  assert.equal(istIndexierbareGeplanteStadt("bielefeld"), false);
});
