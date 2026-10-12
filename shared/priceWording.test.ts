import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizePriceWording, normalizePriceWordingDeep } from "./priceWording.ts";

const N = " €";

test("Komma-Preise mit geschuetztem Leerzeichen", () => {
  assert.equal(normalizePriceWording("ab 149,99€"), `ab 149,99${N}`);
  assert.equal(normalizePriceWording("ab 149,99 €"), `ab 149,99${N}`);
  assert.equal(normalizePriceWording("Full Face ab 1.249,99€ ✓"), `Full Face ab 1.249,99${N} ✓`);
});

test("ab-Preise ohne Cent werden auf ,99 gesetzt", () => {
  assert.equal(normalizePriceWording("Lippen aufspritzen Düsseldorf ab 149€ ✓"), `Lippen aufspritzen Düsseldorf ab 149,99${N} ✓`);
  assert.equal(normalizePriceWording("Unterspritzung ab 199 €. Termin"), `Unterspritzung ab 199,99${N}. Termin`);
});

test("fremde Zahlen und Spannen bleiben", () => {
  assert.equal(normalizePriceWording("am Markt 200–400 €"), "am Markt 200–400 €");
  assert.equal(normalizePriceWording("kostet 299 € woanders"), "kostet 299 € woanders");
  assert.equal(normalizePriceWording("ab 150 €"), "ab 150 €");
});

test("URLs und Schoenheits-OPs unberuehrt", () => {
  const out = normalizePriceWordingDeep({
    a: { text: "ab 149€", url: "/p/ab-149€" },
    op: { pathKey: "schoenheitsoperationen/bruststraffung", text: "ab 2.499€" },
  }) as any;
  assert.equal(out.a.text, `ab 149,99${N}`);
  assert.equal(out.a.url, "/p/ab-149€");
  assert.equal(out.op.text, "ab 2.499€");
});
