import { test } from "node:test";
import assert from "node:assert/strict";
import { footerCityLinks, otherCityLinks, primaryLink } from "./cityLinks.ts";

const LOCS = [
  { slug: "koeln-arcaden", type: "lounge", city: { slug: "koeln", name: "Köln" } },
  { slug: "mediapark-klinik", type: "clinic", city: { slug: "koeln", name: "Köln" } },
  { slug: "aquis-plaza", type: "lounge", city: { slug: "aachen", name: "Aachen" } },
  { slug: "palais-vest", type: "lounge", city: { slug: "recklinghausen", name: "Recklinghausen" } },
  { slug: null, type: "lounge", city: { slug: "x", name: "X" } },
];

test("andere Staedte: ohne aktuellen Standort und ohne Klinik, alphabetisch", () => {
  assert.deepEqual(otherCityLinks(LOCS, "/botox/browlift/", "palais-vest", "Browlift Botox®"), [
    { label: "Browlift Botox Aachen", href: "/standorte/aachen/aquis-plaza/botox/browlift" },
    { label: "Browlift Botox Köln", href: "/standorte/koeln/koeln-arcaden/botox/browlift" },
  ]);
  assert.deepEqual(otherCityLinks(LOCS, "", "x", "Botox"), []);
  assert.deepEqual(otherCityLinks(null, "botox", "x", "Botox"), []);
});

test("Footer: je Lounge drei Behandlungen", () => {
  const f = footerCityLinks(LOCS);
  assert.deepEqual(f.map((c) => c.city), ["Aachen", "Köln", "Recklinghausen"]);
  assert.equal(f[1]!.href, "/standorte/koeln/koeln-arcaden");
  assert.deepEqual(f[1]!.links.map((l) => l.href), [
    "/standorte/koeln/koeln-arcaden/botox",
    "/standorte/koeln/koeln-arcaden/hyaluron/lippen-aufspritzen",
    "/standorte/koeln/koeln-arcaden/hyaluron",
  ]);
  assert.equal(f[1]!.links[0]!.label, "Botox Köln");
});

test("Unterseiten verweisen auf die Hauptseite des Begriffs", () => {
  assert.deepEqual(primaryLink("botox/lipflip", "koeln", "koeln-arcaden", "Köln"), {
    label: "Lippen aufspritzen Köln",
    href: "/standorte/koeln/koeln-arcaden/hyaluron/lippen-aufspritzen",
  });
  assert.equal(primaryLink("hyaluron/hylase", "koeln", "koeln-arcaden", "Köln")?.label, "Lippen aufspritzen Köln");
  assert.equal(primaryLink("botox/masseter", "aachen", "aquis-plaza", "Aachen")?.href, "/standorte/aachen/aquis-plaza/botox");
  assert.equal(primaryLink("hyaluron/jawline", "aachen", "aquis-plaza", "Aachen")?.href, "/standorte/aachen/aquis-plaza/hyaluron");
  assert.equal(primaryLink("hyaluron/lippen-aufspritzen", "koeln", "koeln-arcaden", "Köln"), null);
  assert.equal(primaryLink("botox", "koeln", "koeln-arcaden", "Köln"), null);
  assert.equal(primaryLink("botox/3-zonen-botox-preise", "koeln", "koeln-arcaden", "Köln"), null);
  assert.equal(primaryLink("skinbooster/profhilo", "koeln", "koeln-arcaden", "Köln"), null);
});
