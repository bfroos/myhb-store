import { test } from "node:test";
import assert from "node:assert/strict";
import { rewriteBeforeAfter, rewriteBeforeAfterDeep, rewritesBeforeAfterFor } from "./beforeAfterWording.ts";

test("Zusammensetzungen und Ueberschriften ohne Vorher-Nachher", () => {
  assert.equal(rewriteBeforeAfter("Wie sehen die Browlift Botox Vorher-Nachher-Ergebnisse aus?"), "Wie sehen die Browlift Botox Ergebnisse aus?");
  assert.equal(rewriteBeforeAfter("Im Vorher-Nachher-Vergleich wirkt das Kinn definierter."), "Im Ergebnis wirkt das Kinn definierter.");
  assert.equal(rewriteBeforeAfter("Lippen aufspritzen Vorher-Nachher – Welche Ergebnisse sind möglich?"), "Lippen aufspritzen – Welche Ergebnisse sind möglich?");
  assert.equal(rewriteBeforeAfter("Wann sehe ich das vorher nachher Ergebnis?"), "Wann sehe ich das Ergebnis?");
  assert.equal(rewriteBeforeAfter("Wie stark der Vorher-Nachher-Unterschied ausfällt"), "Wie stark der Unterschied ausfällt");
  assert.equal(rewriteBeforeAfter("Vorher-Nachher bei Masseter Botox® – Welche Ergebnisse sind möglich?"), "Masseter Botox® – Welche Ergebnisse sind möglich?");
  assert.equal(rewriteBeforeAfter("Sofort sichtbare Ergebnisse & Vorher-Nachher-Bilder 💎 Buche jetzt"), "Sofort sichtbare Ergebnisse 💎 Buche jetzt");
  assert.equal(rewriteBeforeAfter("✅ Ärztliche Beratung ✅ Vorher-Nachher, Haltbarkeit"), "✅ Ärztliche Beratung ✅ Haltbarkeit");
  assert.equal(rewriteBeforeAfter("lippen aufspritzen kosten & vorhernachher"), "lippen aufspritzen kosten");
});

test("Leerzeichen am Rand bleiben (Text neben Links)", () => {
  assert.equal(rewriteBeforeAfter(" erzielen beeindruckende Vorher-Nachher-Ergebnisse, die "), " erzielen beeindruckende Ergebnisse, die ");
  assert.equal(rewriteBeforeAfter("ohne Begriff bleibt  wie er ist "), "ohne Begriff bleibt  wie er ist ");
});

test("URLs, Slugs und Schoenheits-OPs bleiben unveraendert, Blog ausgenommen", () => {
  const out = rewriteBeforeAfterDeep({
    data: {
      pathKey: "hyaluron/kinnkorrektur",
      text: "Kinnkorrektur Vorher Nachher",
      link: { url: "https://www.myhealthandbeauty.com/blog/hylase-vorher-nachher", children: [{ text: "Hylase Vorher Nachher" }] },
      related: [{ pathKey: "schoenheitsoperationen/bruststraffung", text: "endgültiges Vorher-Nachher-Ergebnis" }],
    },
  }) as any;
  assert.equal(out.data.text, "Kinnkorrektur");
  assert.equal(out.data.link.url, "https://www.myhealthandbeauty.com/blog/hylase-vorher-nachher");
  assert.equal(out.data.link.children[0].text, "Hylase");
  assert.equal(out.data.related[0].text, "endgültiges Vorher-Nachher-Ergebnis");
  assert.equal(rewritesBeforeAfterFor("/blog-articles/slug/x"), false);
  assert.equal(rewritesBeforeAfterFor("/treatment-pages/by-path/hyaluron/kinnkorrektur"), true);
});
