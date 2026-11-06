import { test } from "node:test";
import assert from "node:assert/strict";
import { istBezahlteMetaBeruehrung, rabattBerechtigt } from "./rabattBerechtigt.ts";

test("Meta-Anzeige mit fbclid ist berechtigt", () => {
  assert.equal(istBezahlteMetaBeruehrung({ fbclid: "abc", utm_source: "facebook", utm_medium: "paid" }), true);
  assert.equal(istBezahlteMetaBeruehrung({ fbclid: "abc" }), true);
});

test("Meta-Anzeige ohne fbclid (Cookie abgelehnt) über UTM", () => {
  assert.equal(istBezahlteMetaBeruehrung({ utm_source: "instagram", utm_medium: "paid_social" }), true);
});

test("Link im Instagram-Profil ist nicht berechtigt", () => {
  assert.equal(istBezahlteMetaBeruehrung({ fbclid: "abc", utm_source: "ig", utm_medium: "social" }), false);
  assert.equal(istBezahlteMetaBeruehrung({ utm_source: "instagram", utm_medium: "social_organic" }), false);
});

test("Google-Suche, Google-Anzeige und direkt sind nicht berechtigt", () => {
  assert.equal(istBezahlteMetaBeruehrung({ utm_source: "google", utm_medium: "organic" }), false);
  assert.equal(istBezahlteMetaBeruehrung({ utm_source: "google", utm_medium: "cpc" }), false);
  assert.equal(istBezahlteMetaBeruehrung({ utm_source: "direct", utm_medium: "none" }), false);
  assert.equal(istBezahlteMetaBeruehrung(null), false);
  assert.equal(rabattBerechtigt(null, null), false);
});

test("Meta-Klick früher (first) reicht, auch wenn der letzte Besuch organisch war", () => {
  assert.equal(
    rabattBerechtigt({ first: { fbclid: "x" }, last: { utm_source: "google", utm_medium: "organic" } }),
    true,
  );
});
