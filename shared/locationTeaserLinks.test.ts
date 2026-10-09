import { test } from "node:test";
import assert from "node:assert/strict";
import {
  locationTeaserImageAlt,
  locationTeaserPath,
  locationTeaserTitle,
  uniqueTeaserLocations,
} from "./locationTeaserLinks.ts";

// /api/locations/bookable?locale=de&treatmentType=minimally-invasive
// &pathKey=hyaluron/lippen-aufspritzen, Strapi 08.10.2026 (gekuerzt).
const BOOKABLE_LIPPEN = [
  { documentId: "v2t8ez9tf0yvh0tbwefgj252", slug: "gesundbrunnencenter", name: "Gesundbrunnen-Center", city: { name: "Berlin", slug: "berlin" } },
  { documentId: "cierwd786gu0xavgfxhbn7fc", slug: "forum", name: "Forum Duisburg", city: { name: "Duisburg", slug: "duisburg" } },
  { documentId: "iua4phnw8456a4r3ps76hiv9", slug: "duesseldorf-arcaden", name: "Düsseldorf Arcaden", city: { name: "Düsseldorf", slug: "duesseldorf" } },
  { documentId: "men6tleuh3z52hr2fteb7qma", slug: "k-in-lautern", name: "K in Lautern", city: { name: "Kaiserslautern", slug: "kaiserslautern" } },
  { documentId: "gerxvf27cxdwldh566jhs1sv", slug: "hoefe-am-bruehl", name: "Höfe am Brühl", city: { name: "Leipzig", slug: "leipzig" } },
  { documentId: "v3v1lbmcu7acaujxhjs3q2ek", slug: "minto", name: "Minto", city: { name: "Mönchengladbach", slug: "moenchengladbach" } },
  { documentId: "k31r2nbcxs6uz4xnsy6ngtop", slug: "palais-vest", name: "Palais Vest", city: { name: "Recklinghausen", slug: "recklinghausen" } },
  { documentId: "uyorli77ftb6w47wbdshbod1", slug: "aquis-plaza", name: "Aquis Plaza", city: { name: "Aachen", slug: "aachen" } },
  { documentId: "byfq4sxv29vjz745sr3eavvv", slug: "koeln-arcaden", name: "Köln Arcaden", city: { name: "Köln", slug: "koeln" } },
];

test("Lippen aufspritzen: neun Titel aus Behandlung + Stadt", () => {
  const titles = BOOKABLE_LIPPEN.map((l) => locationTeaserTitle(l, { treatmentName: "Lippen aufspritzen", mainInformation: "city" }));
  assert.deepEqual([...titles].sort(), [
    "Lippen aufspritzen Aachen",
    "Lippen aufspritzen Berlin",
    "Lippen aufspritzen Duisburg",
    "Lippen aufspritzen Düsseldorf",
    "Lippen aufspritzen Kaiserslautern",
    "Lippen aufspritzen Köln",
    "Lippen aufspritzen Leipzig",
    "Lippen aufspritzen Mönchengladbach",
    "Lippen aufspritzen Recklinghausen",
  ]);
});

test("Lippen aufspritzen: Ziel-URLs nach /standorte/{stadt}/{lounge}/{pathKey}, Köln nur Arcaden", () => {
  const paths = BOOKABLE_LIPPEN.map((l) => locationTeaserPath(l, "hyaluron/lippen-aufspritzen"));
  for (const path of paths) assert.match(path!, /^\/standorte\/[a-z-]+\/[a-z-]+\/hyaluron\/lippen-aufspritzen$/);
  assert.equal(paths.filter((p) => p!.startsWith("/standorte/koeln/")).length, 1);
  assert.ok(paths.includes("/standorte/koeln/koeln-arcaden/hyaluron/lippen-aufspritzen"));
  assert.ok(!paths.some((p) => p!.includes("mediapark")));
  assert.equal(new Set(paths).size, 9);
});

test("Titel ohne Behandlung wie bisher (Stadt bzw. Standortname), Namen werden getrimmt", () => {
  const berlin = BOOKABLE_LIPPEN[0]!;
  assert.equal(locationTeaserTitle(berlin, { mainInformation: "city" }), "Berlin");
  assert.equal(locationTeaserTitle(berlin, { mainInformation: "location" }), "Gesundbrunnen-Center");
  assert.equal(locationTeaserTitle(berlin, { treatmentName: " Hyaluron Unterspritzung ", mainInformation: "city" }), "Hyaluron Unterspritzung Berlin");
  assert.equal(locationTeaserTitle(berlin, { treatmentName: "Stirnfalte Botox®" }), "Stirnfalte Botox® Berlin");
});

test("Pfad: ohne Behandlung Standortseite, ohne Stadt-Slug kein Link", () => {
  assert.equal(locationTeaserPath(BOOKABLE_LIPPEN[0]!), "/standorte/berlin/gesundbrunnencenter");
  assert.equal(locationTeaserPath(BOOKABLE_LIPPEN[0]!, "/botox/stirnfalte/"), "/standorte/berlin/gesundbrunnencenter/botox/stirnfalte");
  assert.equal(locationTeaserPath({ slug: "x", city: { name: "X", slug: "" } }, "botox"), null);
});

test("Doppelte Standorte und Standorte ohne Ziel fallen weg", () => {
  const list = [...BOOKABLE_LIPPEN, BOOKABLE_LIPPEN[8]!, { slug: "ohne-stadt", name: "Ohne Stadt", city: null }];
  assert.equal(uniqueTeaserLocations(list).length, 9);
  assert.deepEqual(uniqueTeaserLocations(null), []);
});

test("Alt-Text: Marke, Standort, Stadt", () => {
  assert.equal(locationTeaserImageAlt(BOOKABLE_LIPPEN[0]!), "MY HEALTH & BEAUTY Gesundbrunnen-Center, Berlin");
  assert.equal(locationTeaserImageAlt({ slug: "x", name: "Leipzig", city: { name: "Leipzig", slug: "leipzig" } }), "MY HEALTH & BEAUTY Leipzig");
});
