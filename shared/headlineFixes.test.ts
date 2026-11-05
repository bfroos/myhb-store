import { test } from "node:test";
import assert from "node:assert/strict";
import fixes from "../server/assets/headline-fixes.json" with { type: "json" };
import { applyHeadlineFixes } from "./headlineFixes.ts";

test("ersetzt nur exakte Treffer, auch tief im Baum", () => {
  const blocks = {
    treatmentDetails: { headline: "Alle Details zur Lip Flip Botox Köln " },
    faq: { faqs: [{ question: "Ab welchem Alter macht Botox Sinn?", answer: [{ text: "macht Botox Sinn" }] }] },
    n: 3,
  };
  const out = applyHeadlineFixes(blocks, {
    "Alle Details zur Lip Flip Botox Köln": "Alles zum Lip Flip mit Botox in Köln",
    "Ab welchem Alter macht Botox Sinn?": "Ab welchem Alter ist Botox sinnvoll?",
  });
  assert.equal(out.treatmentDetails.headline, "Alles zum Lip Flip mit Botox in Köln");
  assert.equal(out.faq.faqs[0].question, "Ab welchem Alter ist Botox sinnvoll?");
  assert.equal(out.faq.faqs[0].answer[0].text, "macht Botox Sinn");
  assert.equal(out.n, 3);
  assert.equal(applyHeadlineFixes(blocks, null), blocks);
});

test("Korrekturen halten die Regeln ein und aendern wirklich etwas", () => {
  for (const [page, map] of Object.entries(fixes as Record<string, Record<string, string>>)) {
    for (const [from, to] of Object.entries(map)) {
      assert.notEqual(from, to, page);
      assert.ok(to.trim().length > 3, `${page}: leer`);
      assert.doesNotMatch(to, /MYH\s?&\s?B/, `${page}: ${to}`);
    }
  }
});
