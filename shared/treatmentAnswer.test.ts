import { test } from "node:test";
import assert from "node:assert/strict";
import { treatmentAnswer } from "./treatmentAnswer.ts";

test("Kurzantwort mit Preis aus Strapi, Dauer und Haltbarkeit", () => {
  const a = treatmentAnswer({ pathKey: "botox/zornesfalte", name: "Zornesfalte", priceInEuroCent: 14999, isStartingPrice: true });
  assert.ok(a);
  assert.match(a!, /kostet die Behandlung ab 149,99 €\./);
  assert.match(a!, /dauert 20–30 Minuten, das Ergebnis hält meist 3–4 Monate\./);
  assert.match(a!, /an 9 Standorten/);
});

test("Stadtseite nennt Stadt und Center", () => {
  const a = treatmentAnswer({ pathKey: "skinbooster/profhilo", name: "Profhilo", priceInEuroCent: 29999, city: "Köln", center: "Köln Arcaden" });
  assert.match(a!, /in Köln \(Köln Arcaden\) kostet die Behandlung ab 299,99/);
});

test("ohne Bausteine keine Kurzantwort; Lippen-Pilot und OPs ausgenommen", () => {
  assert.equal(treatmentAnswer({ pathKey: "fettwegspritze/lemon-bottle-bauch", name: "x", priceInEuroCent: 29999 }), null);
  assert.equal(treatmentAnswer({ pathKey: "hyaluron/lippen-aufspritzen", name: "x", priceInEuroCent: 14999 }), null);
  assert.equal(treatmentAnswer({ pathKey: "schoenheitsoperationen/facelift", name: "x", priceInEuroCent: 399900 }), null);
});

test("Leitplanken: kein Markenname, kein Vorher-Nachher, keine Heilversprechen", () => {
  const keys = ["botox", "hyaluron", "skinbooster", "infusionen", "anti-haarausfall", "botox/stirnfalte", "botox/masseter", "hyaluron/nasolabialfalte", "skinbooster/polynukleotide-lachssperma", "infusionen/vitamin-c-infusion"];
  for (const k of keys) {
    const a = treatmentAnswer({ pathKey: k, name: "x", priceInEuroCent: 14999 }) ?? "";
    assert.doesNotMatch(a, /botox|vorher[- ]?nachher|garantiert|heilt|dauerhaft|rabatt|neukund/i, k);
  }
});
