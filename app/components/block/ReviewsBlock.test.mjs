// D-01 (08.10.2026): Die Bewertungs-Ueberschrift darf nur EINMAL als H2 im
// HTML stehen. Vorher gab ReviewsBlock auf www eine Mobil- und eine
// Desktop-H2 aus (per CSS je eine versteckt) - im Audit doppelte H2
// "Ergebnisse der Lippenbehandlung bei MY".
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("./ReviewsBlock.vue", import.meta.url), "utf8");
const template = source.slice(source.indexOf("<template>"), source.indexOf("<script"));

test("ReviewsBlock rendert genau eine H2", () => {
  assert.equal((template.match(/<h2\b/g) || []).length, 1);
});

test("Desktop-Ueberschrift ist reine Optik (aria-hidden, keine Ueberschrift)", () => {
  assert.match(template, /<p class="reviews__title" aria-hidden="true">/);
  assert.doesNotMatch(template, /v-if="isAdsMode" class="reviews__title"/);
});

test("H2 bleibt auf Desktop im Accessibility-Tree (visuell versteckt statt display:none)", () => {
  const desktop = source.slice(source.indexOf("@media (min-width: 1200px)"));
  const rule = /\.reviews__header--static\s*\{([^}]*)\}/.exec(desktop);
  assert.ok(rule, "Regel fuer .reviews__header--static fehlt");
  assert.doesNotMatch(rule[1], /display:\s*none/);
  assert.match(rule[1], /clip:\s*rect\(0, 0, 0, 0\)/);
});
