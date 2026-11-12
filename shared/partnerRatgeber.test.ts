/**
 * Ratgeber fuer Aerzte (E32, #435): Pfade, Laengen, Wortwahl, Schema.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { RATGEBER, findeRatgeber, ratgeberPfad, ratgeberSchema } from "./partnerRatgeber.ts";

const text = (a: (typeof RATGEBER)[number]) => JSON.stringify(a);

test("Slugs sind eindeutig und URL-tauglich", () => {
  const slugs = RATGEBER.map((a) => a.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const s of slugs) assert.match(s, /^[a-z0-9-]+$/);
  assert.equal(ratgeberPfad("x"), "/partnerpraxis/x");
  assert.equal(findeRatgeber("gibt-es-nicht"), undefined);
});

test("Titel und Beschreibung passen in die Google-Anzeige", () => {
  for (const a of RATGEBER) {
    assert.ok(a.seoTitel.length <= 60, `${a.slug}: Titel ${a.seoTitel.length} Zeichen`);
    assert.ok(a.beschreibung.length >= 120 && a.beschreibung.length <= 160, `${a.slug}: Beschreibung ${a.beschreibung.length} Zeichen`);
  }
});

test("Jede Seite hat Kurzantwort, Fragen und Quellen", () => {
  for (const a of RATGEBER) {
    assert.ok(a.kurzGesagt.length > 100, a.slug);
    assert.ok(a.fragen.length >= 3, a.slug);
    assert.ok(a.quellen.length >= 1, a.slug);
    for (const q of a.quellen) assert.match(q.url, /^https:\/\//);
  }
});

test("Wortwahl: keine weiblichen Formen, MYHB-Schreibweise, keine Gebuehren", () => {
  for (const a of RATGEBER) {
    const t = text(a);
    assert.doesNotMatch(t, /Kundin|Ärztin|Beraterin|Patientin/, a.slug);
    assert.doesNotMatch(t, /MYH&B/, a.slug);
    assert.doesNotMatch(t, /Grundgebühr|Startgebühr|9\.900|1\.490/, a.slug);
  }
});

test("Rechenbeispiel geht auf", () => {
  const a = findeRatgeber("verdienst-eigene-praxis")!;
  const tab = a.abschnitte.find((x) => x.titel.startsWith("Rechenbeispiel"))!.tabelle!;
  const zahl = (s: string) => Number(s.replace(/[^\d−-]/g, "").replace("−", "-"));
  const werte = tab.slice(1).map((z) => zahl(z[1]));
  const summe = werte.slice(0, -1).reduce((x, y) => x + y, 0);
  assert.equal(summe, werte.at(-1));
});

test("Schema: Article und FAQPage mit denselben Fragen", () => {
  const a = RATGEBER[0];
  const [artikel, faq] = ratgeberSchema(a, "https://www.myhealthandbeauty.com/") as any[];
  assert.equal(artikel["@type"], "Article");
  assert.equal(artikel.url, `https://www.myhealthandbeauty.com/partnerpraxis/${a.slug}`);
  assert.equal(faq.mainEntity.length, a.fragen.length);
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, a.fragen[0].antwort);
});

test("Kacheln der Partnerseite verlinken nur vorhandene Ratgeber, jede Gruppe hat Artikel", async () => {
  const { FUNDAMENT, AUTOMATISIERUNG, PAKETE } = await import("./partnerProgramm.ts");
  const links = [...FUNDAMENT, ...AUTOMATISIERUNG, ...PAKETE].map((k) => k.ratgeber).filter(Boolean) as string[];
  assert.ok(links.length >= 6);
  for (const s of links) assert.ok(findeRatgeber(s), s);
  const { RATGEBER_GRUPPEN, gruppeVon } = await import("./partnerRatgeber.ts");
  for (const g of RATGEBER_GRUPPEN) assert.ok(RATGEBER.some((a) => gruppeVon(a) === g.gruppe), g.gruppe);
});

test("Partnerseiten: Canonical immer auf www, auch im go.-Deployment", async () => {
  const { PARTNER_SITE } = await import("./partnerProgramm.ts");
  assert.equal(PARTNER_SITE, "https://www.myhealthandbeauty.com");
});
