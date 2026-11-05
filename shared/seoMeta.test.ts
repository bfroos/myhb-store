import { test } from "node:test";
import assert from "node:assert/strict";
import { altFromFileName, composeTitle } from "./seoMeta.ts";

test("Markenzusatz nur, wenn der Titel dann noch passt", () => {
  assert.equal(composeTitle("Botox Köln", "|", "MY HEALTH & BEAUTY"), "Botox Köln | MY HEALTH & BEAUTY");
  assert.equal(
    composeTitle("Lip Flip mit Botox Kaiserslautern: ab 149,99 €", "|", "MY HEALTH & BEAUTY"),
    "Lip Flip mit Botox Kaiserslautern: ab 149,99 €",
  );
  assert.equal(composeTitle("Über MY HEALTH & BEAUTY", "|", "MY HEALTH & BEAUTY"), "Über MY HEALTH & BEAUTY");
  assert.equal(composeTitle("Botox", "|", ""), "Botox");
});

test("Alt-Text aus dem Dateinamen", () => {
  assert.equal(altFromFileName("3/4/koeln_arcaden_plan_da4dc4f17a.jpg"), "Koeln arcaden plan");
  assert.equal(altFromFileName("mann_und_frau_schwarz_f62861ae47.png"), "Mann und frau schwarz");
  assert.equal(altFromFileName("IMG_4711_ab12cd34ef.jpg"), "");
  assert.equal(altFromFileName("Bildschirmfoto 2023-03-14 um 16.40.25.png"), "");
  assert.equal(altFromFileName(null), "");
});
