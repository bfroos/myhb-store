import { test } from "node:test";
import assert from "node:assert/strict";
import thumbs from "./storyVideoThumbs.json" with { type: "json" };
import { buildStoryVideos, groupStoryVideos, slugify, storyVideoSchema, toStoryVideo, type StoryInput } from "./storyVideos.ts";

const v = (url: string) => ({ url, mime: "video/mp4" });

// Auszug aus Strapi (06.11.2026), beide Formate, roh mit "BTX".
const STORIES: StoryInput[] = [
  { id: 120, title: "Browlift mit BTX", subtitle: "Aquis Plaza Aachen", createdAt: "2026-01-29T20:48:36.296Z", video: v("https://media.myhb.app/a.mp4") },
  { id: 121, title: "Browlift mit BTX", subtitle: "Köln Arcaden", video: null },
  { id: 115, title: "BTX ohne Termin (Arabisch)", subtitle: "Palais Vest Recklinghausen", video: v("https://x/b.mp4") },
  { id: 119, title: "BTX ohne Termin", subtitle: "Palais Vest Recklinghausen", video: v("https://x/c.mp4") },
  { id: 118, title: "1. Mal BTX mit 52 Jahren", subtitle: "Minto Mönchengladbach", video: v("https://x/d.mp4") },
  { id: 116, title: "BTX gegen Kopfschmerzen", subtitle: "Leipzig Höfe am Brühl", video: v("https://x/e.mp4") },
  { id: 117, title: "BTX gegen das Erdbeerkinn", subtitle: "Köln Arcaden", video: v("https://x/f.mp4") },
  { id: 125, title: "Stirnfalte & Zornesfalte", subtitle: "Köln Arcaden", video: v("https://x/g.mp4") },
  { id: 126, title: "Zornesfalte & Stirnfalte ", subtitle: "Berlin Gesundbrunnen Center", video: v("https://x/h.mp4") },
  { id: 114, title: "Lippenunterspritzung (nachher)", subtitle: "K in Lautern Kaiserslautern", video: v("https://x/i.mp4") },
  { id: 107, title: "Lippenkorrektur", subtitle: "K in Lautern Kaiserslautern", video: v("https://x/j.mp4") },
  { id: 108, title: "Standortführung", subtitle: "Palais Vest Recklinghausen", video: v("https://x/k.mp4") },
  { id: 113, title: "Vitamin C Infusion", subtitle: "Köln Arcaden", video: v("https://x/l.mp4") },
  { id: 112, title: "Vampir-Lifting mit PRP", subtitle: "Leipzig Höfe am Brühl", video: v("https://x/m.mp4") },
  { id: 134, title: "MY Leipzig ", subtitle: " Kostenlose Beratung Erfahrung ", internalLabel: "MY Leipzig ", video: v("https://x/n.mp4") },
  { id: 136, title: "MY Köln", subtitle: "BTX Bewertung", video: v("https://x/o.mp4") },
  { id: 150, title: "MY Düsseldorf", subtitle: "Browlift Erfahrung", video: v("https://x/p.mp4") },
  { id: 157, title: "MY Köln", subtitle: "Hyaluron Jawline Behandlung Rezension", video: v("https://x/q.mp4") },
  { id: 164, title: "MY Kaiserslautern", subtitle: "Kinnkorrektur Erfahrung", video: v("https://x/r.mp4") },
  { id: 192, title: "MY Aachen", subtitle: null, internalLabel: "MY Aachen", video: v("https://x/s.mp4") },
];

const all = buildStoryVideos(STORIES);
const bySlug = (s: string) => all.find((x) => x.slug === s)!;

test("slugify: Umlaute, Sonderzeichen, Ränder", () => {
  assert.equal(slugify("Höfe am Brühl & Straße "), "hoefe-am-bruehl-strasse");
  assert.equal(slugify("1. Mal"), "1-mal");
});

test("Slugs aus Titel + Stadt, eindeutig, stabil", () => {
  assert.deepEqual(
    all.map((x) => x.slug),
    [
      "lippenkorrektur-kaiserslautern",
      "standortfuehrung-recklinghausen",
      "vampir-lifting-mit-prp-leipzig",
      "vitamin-c-infusion-koeln",
      "lippenunterspritzung-kaiserslautern",
      "botox-ohne-termin-arabisch-recklinghausen",
      "botox-gegen-kopfschmerzen-leipzig",
      "botox-gegen-das-erdbeerkinn-koeln",
      "mit-52-zum-ersten-mal-botox-moenchengladbach",
      "botox-ohne-termin-recklinghausen",
      "browlift-mit-botox-aachen",
      "stirnfalte-und-zornesfalte-koeln",
      "zornesfalte-und-stirnfalte-berlin",
      "kostenlose-beratung-leipzig",
      "botox-koeln",
      "browlift-duesseldorf",
      "jawline-behandlung-mit-hyaluron-koeln",
      "kinnkorrektur-kaiserslautern",
      "kundenfeedback-aachen",
    ],
  );
  // Reihenfolge der Eingabe aendert nichts.
  assert.deepEqual(buildStoryVideos([...STORIES].reverse()).map((x) => x.slug), all.map((x) => x.slug));
});

test("doppelter Slug bekommt die ID, der erste behaelt seinen", () => {
  const twin = buildStoryVideos([
    { id: 2, title: "Lippenkorrektur", subtitle: "Minto", video: v("https://x/2.mp4") },
    { id: 1, title: "Lippenkorrektur", subtitle: "Mönchengladbach", video: v("https://x/1.mp4") },
  ]);
  assert.deepEqual(twin.map((x) => x.slug), ["lippenkorrektur-moenchengladbach", "lippenkorrektur-moenchengladbach-2"]);
});

test("ohne Video oder ohne bekannten Standort keine Seite", () => {
  assert.equal(all.some((x) => x.id === 121), false);
  assert.equal(toStoryVideo({ id: 1, title: "Lippen", subtitle: "Hamburg", video: v("https://x/z.mp4") }), null);
  assert.equal(toStoryVideo({ id: 1, title: "Lippen", subtitle: "Köln", video: { url: "https://x/z.jpg", mime: "image/jpeg" } }), null);
});

test("H1 in natuerlichem Deutsch", () => {
  assert.equal(bySlug("browlift-mit-botox-aachen").h1, "Browlift mit Botox im Aquis Plaza Aachen – Erfahrung");
  assert.equal(bySlug("botox-ohne-termin-arabisch-recklinghausen").h1, "Botox ohne Termin im Palais Vest Recklinghausen – Erfahrung auf Arabisch");
  assert.equal(bySlug("lippenunterspritzung-kaiserslautern").h1, "Lippenunterspritzung im K in Lautern Kaiserslautern – Ergebnis");
  assert.equal(bySlug("standortfuehrung-recklinghausen").h1, "Standortführung im Palais Vest Recklinghausen");
  assert.equal(bySlug("kostenlose-beratung-leipzig").h1, "Kostenlose Beratung in den Höfen am Brühl Leipzig – Erfahrung");
  assert.equal(bySlug("kundenfeedback-aachen").h1, "Kundenfeedback im Aquis Plaza Aachen");
});

test("Zuordnung Titel -> Behandlung je Standort", () => {
  const links = Object.fromEntries(all.map((x) => [x.slug, x.linkPath]));
  assert.deepEqual(links, {
    "lippenkorrektur-kaiserslautern": "/standorte/kaiserslautern/k-in-lautern/hyaluron/lippenkorrektur",
    "standortfuehrung-recklinghausen": "/standorte/recklinghausen/palais-vest",
    "vampir-lifting-mit-prp-leipzig": "/standorte/leipzig/hoefe-am-bruehl/skinbooster/vampir-lifting-prp",
    "vitamin-c-infusion-koeln": "/standorte/koeln/koeln-arcaden/infusionen/vitamin-c-infusion",
    "lippenunterspritzung-kaiserslautern": "/standorte/kaiserslautern/k-in-lautern/hyaluron/lippen-aufspritzen",
    "botox-ohne-termin-arabisch-recklinghausen": "/standorte/recklinghausen/palais-vest/botox",
    "botox-gegen-kopfschmerzen-leipzig": "/standorte/leipzig/hoefe-am-bruehl/botox/masseter",
    "botox-gegen-das-erdbeerkinn-koeln": "/standorte/koeln/koeln-arcaden/botox/erdbeerkinn",
    "mit-52-zum-ersten-mal-botox-moenchengladbach": "/standorte/moenchengladbach/minto/botox",
    "botox-ohne-termin-recklinghausen": "/standorte/recklinghausen/palais-vest/botox",
    "browlift-mit-botox-aachen": "/standorte/aachen/aquis-plaza/botox/browlift",
    "stirnfalte-und-zornesfalte-koeln": "/standorte/koeln/koeln-arcaden/botox/stirnfalte",
    "zornesfalte-und-stirnfalte-berlin": "/standorte/berlin/gesundbrunnencenter/botox/zornesfalte",
    "kostenlose-beratung-leipzig": "/standorte/leipzig/hoefe-am-bruehl",
    "botox-koeln": "/standorte/koeln/koeln-arcaden/botox",
    "browlift-duesseldorf": "/standorte/duesseldorf/duesseldorf-arcaden/botox/browlift",
    "jawline-behandlung-mit-hyaluron-koeln": "/standorte/koeln/koeln-arcaden/hyaluron/jawline",
    "kinnkorrektur-kaiserslautern": "/standorte/kaiserslautern/k-in-lautern/hyaluron/kinnkorrektur",
    "kundenfeedback-aachen": "/standorte/aachen/aquis-plaza",
  });
});

test("Gruppen der Uebersicht in fester Reihenfolge", () => {
  assert.deepEqual(groupStoryVideos(all).map((g) => g.group), ["Botox", "Hyaluron", "Vampir-Lifting (PRP)", "Infusionen", "Beratung und Standort"]);
});

test("Texte: 2-4 Saetze, du-Form, Markenname, keine Preise, kein BTX, kein -innen", () => {
  for (const x of all) {
    assert.ok(x.sentences.length >= 2 && x.sentences.length <= 4, x.slug);
    const text = [x.h1, x.description, x.linkText].join(" ");
    assert.doesNotMatch(text, /€|\bEuro\b|\d+ ?%|BTX|MYHB|MYH&B|innen\b|garantiert|dauerhaft|schmerzfrei|heilt/i, x.slug);
    assert.doesNotMatch(text, /\bSie\b|\bIhr(e|en)?\b/, x.slug);
  }
});

test("VideoObject mit Pflichtfeldern", () => {
  const s = storyVideoSchema(bySlug("browlift-mit-botox-aachen"), "https://www.myhealthandbeauty.com/");
  assert.equal(s["@type"], "VideoObject");
  assert.deepEqual(s.thumbnailUrl, ["https://www.myhealthandbeauty.com/videos/thumbs/browlift-mit-botox-aachen.jpg"]);
  assert.equal(s.uploadDate, "2026-01-29T20:48:36Z");
  assert.equal(s.contentUrl, "https://media.myhb.app/a.mp4");
  assert.ok(String(s.name).length > 0 && String(s.description).length > 0);
});

test("Story ohne Vorschaubild faellt heraus", () => {
  const only = buildStoryVideos(STORIES, (slug) => slug === "botox-koeln");
  assert.deepEqual(only.map((x) => x.slug), ["botox-koeln"]);
});

test("Bilderliste passt zu den Slugs", () => {
  for (const s of thumbs as string[]) assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/);
  for (const x of all) assert.ok((thumbs as string[]).includes(x.slug), `kein Bild: ${x.slug}`);
});
