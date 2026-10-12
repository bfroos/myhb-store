import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SEO_CITY_LIPPEN,
  SEO_HUB_LIPPEN,
  SEO_LIPPEN_COMPARE,
  isSeoPilotHub,
  paragraphText,
  seoPilotCity,
} from "./seoPilotLippen.ts";

/** Alle Texte des Pilots als ein String je Seite. */
function allText(x: unknown): string {
  if (typeof x === "string") return x;
  if (Array.isArray(x)) return x.map(allText).join(" \n ");
  // Nur sichtbarer Text: URLs (href) und Schluessel (pathKey) zaehlen nicht.
  if (x && typeof x === "object")
    return Object.entries(x)
      .filter(([k]) => !["href", "pathKey", "key", "citySlug", "locationSlug"].includes(k))
      .map(([, v]) => allText(v))
      .join(" \n ");
  return "";
}

const PAGES: Array<[string, string]> = [
  ["Hub", allText(SEO_HUB_LIPPEN) + allText(SEO_LIPPEN_COMPARE)],
  ...Object.entries(SEO_CITY_LIPPEN).map(([k, v]) => [k, allText(v)] as [string, string]),
];

test("Leitplanken: kein Dr.-Titel ausser Ruppert, kein Markenname, kein MYH&B", () => {
  for (const [name, text] of PAGES) {
    const titles = text.match(/\bDr\.?\s+[A-ZÄÖÜ][\wäöüß]+(?:\s+[A-ZÄÖÜ][\wäöüß]+)?/g) ?? [];
    for (const t of titles) assert.match(t, /Ruppert/, `${name}: ${t}`);
    assert.doesNotMatch(text, /botox|botulinum/i, name);
    assert.doesNotMatch(text, /MYH&B|MYH\s*&\s*B\b/, name);
  }
});

test("Leitplanken: kein Vorher-Nachher, kein Neukundenrabatt, keine Heilversprechen", () => {
  for (const [name, text] of PAGES) {
    assert.doesNotMatch(text, /vorher[- ]?nachher/i, name);
    assert.doesNotMatch(text, /neukund|rabatt|\d+\s*%/i, name);
    assert.doesNotMatch(text, /garantiert|heilt|dauerhaft|für immer|schmerzfrei/i, name);
  }
});

test("Preise einheitlich mit Komma und Leerzeichen vor dem Euro-Zeichen", () => {
  for (const [name, text] of PAGES) {
    assert.doesNotMatch(text, /\d€/, `${name}: Euro ohne Leerzeichen`);
    assert.doesNotMatch(text, /\b1[49]9(?:,|\.)?\s?€/, `${name}: Preis ohne ,99`);
  }
});

test("Jede Stadtseite verlinkt im ersten Teil auf den Hub und hat eigene Fakten", () => {
  const intros = Object.values(SEO_CITY_LIPPEN).map((c) => c.intro.map(paragraphText).join(" "));
  for (const c of Object.values(SEO_CITY_LIPPEN)) {
    const hubLink = c.intro.flat().some((p) => typeof p !== "string" && p.href === "/behandlungen/hyaluron/lippen-aufspritzen");
    assert.ok(hubLink, `${c.key}: Link auf den Hub fehlt`);
    assert.ok(c.faqs.length >= 5, `${c.key}: zu wenige lokale Fragen`);
    assert.ok(c.parking.length > 0 && c.transit.length > 0 && c.serviceArea.length >= 3, c.key);
    assert.ok(paragraphText(c.intro[0]!).includes(c.center), `${c.key}: Center im ersten Absatz`);
  }
  // Grobe Dubletten-Pruefung: die Einleitungen teilen kaum Saetze.
  const sentences = intros.map((t) => new Set(t.split(/(?<=[.!?])\s+/)));
  const shared = [...sentences[0]!].filter((s) => sentences[1]!.has(s));
  assert.ok(shared.length <= 1, `geteilte Saetze: ${shared.join(" | ")}`);
});

test("Pilot-Weiche: nur Lippen in Köln Arcaden und Düsseldorf Arcaden", () => {
  assert.ok(seoPilotCity("koeln", "koeln-arcaden", "hyaluron/lippen-aufspritzen"));
  assert.ok(seoPilotCity("duesseldorf", "duesseldorf-arcaden", "/hyaluron/lippen-aufspritzen/"));
  assert.equal(seoPilotCity("koeln", "koeln-arcaden", "hyaluron/lippenkorrektur"), null);
  assert.equal(seoPilotCity("aachen", "aquis-plaza", "hyaluron/lippen-aufspritzen"), null);
  assert.equal(isSeoPilotHub("hyaluron/lippen-aufspritzen"), true);
  assert.equal(isSeoPilotHub("hyaluron/russian-lips"), false);
});

test("Meta-Angaben in sinnvoller Laenge", () => {
  for (const c of [SEO_HUB_LIPPEN, ...Object.values(SEO_CITY_LIPPEN)]) {
    assert.ok(c.metaTitle.length <= 60, `Title zu lang: ${c.metaTitle}`);
    assert.ok(c.metaDescription.length >= 120 && c.metaDescription.length <= 160, `Description: ${c.metaDescription.length}`);
  }
});
