import { test } from "node:test";
import assert from "node:assert/strict";
import { SEO_TITLE_TESTS, seoTitleTest } from "./seoTitleTests.ts";

test("Titel-Test greift nur fuer die zwei Testseiten", () => {
  assert.ok(seoTitleTest("botox", "recklinghausen", "palais-vest"));
  assert.ok(seoTitleTest("/botox/", "leipzig", "hoefe-am-bruehl"));
  assert.equal(seoTitleTest("botox", "koeln", "koeln-arcaden"), null);
  assert.equal(seoTitleTest("botox/stirnfalte", "leipzig", "hoefe-am-bruehl"), null);
});

test("Titel und Description halten die Regeln ein", () => {
  for (const [key, t] of Object.entries(SEO_TITLE_TESTS)) {
    const p = "ab 149,99 €";
    const title = t.title(p);
    const desc = t.description(p);
    assert.ok(title.length <= 65, `${key}: Title ${title.length} Zeichen`);
    assert.ok(desc.length <= 170, `${key}: Description ${desc.length} Zeichen`);
    assert.ok(title.includes(p) && desc.includes(p), `${key}: Preis fehlt`);
    assert.doesNotMatch(title + desc, /rabatt|neukund|garantiert|heilt|MYH&B|:innen/i, key);
    assert.doesNotMatch(t.title(""), /ab\s*$/, `${key}: ohne Preis kein haengendes "ab"`);
  }
});
