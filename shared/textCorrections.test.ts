import { test } from "node:test";
import assert from "node:assert/strict";
import all from "../server/assets/text-corrections.json" with { type: "json" };
import { applyTextCorrections, correctionTarget, correctionsFor, type TextCorrection } from "./textCorrections.ts";

const PAIRS = all as TextCorrection[];

test("Seite aus dem Strapi-Pfad", () => {
  assert.deepEqual(correctionTarget("/treatment-pages/koeln/koeln-arcaden/botox/zornesfalte"), { pathKey: "botox/zornesfalte", scope: "koeln/koeln-arcaden" });
  assert.deepEqual(correctionTarget("/treatment-pages/by-path/botox/zornesfalte"), { pathKey: "botox/zornesfalte", scope: "behandlungen" });
  assert.equal(correctionTarget("/blog-articles"), null);
});

test("Standortpaar trifft nur seinen Standort", () => {
  const pairs: TextCorrection[] = [{ pathKey: "x", scope: "duisburg/forum", find: "in den Köln Arcaden", replace: "im Forum Duisburg" }];
  const page = { data: { treatmentPage: { about: { headline: "Ärztlich geplant in den Köln Arcaden" } } } };
  const koeln = applyTextCorrections(page, correctionsFor(pairs, "/treatment-pages/koeln/koeln-arcaden/x"));
  const duisburg = applyTextCorrections(page, correctionsFor(pairs, "/treatment-pages/duisburg/forum/x"));
  assert.equal(koeln.data.treatmentPage.about.headline, "Ärztlich geplant in den Köln Arcaden");
  assert.equal(duisburg.data.treatmentPage.about.headline, "Ärztlich geplant im Forum Duisburg");
  assert.equal(page.data.treatmentPage.about.headline, "Ärztlich geplant in den Köln Arcaden", "Original bleibt");
});

test("Paar mit pfad aendert nur dieses Feld", () => {
  const pairs: TextCorrection[] = [{ pathKey: "x", scope: "*", find: "2 bis 3", replace: "3 bis 7", pfad: "faq.items[1].text" }];
  const page = { data: { treatmentPage: { faq: { items: [{ text: "2 bis 3" }, { text: "2 bis 3" }] } } } };
  const out = applyTextCorrections(page, correctionsFor(pairs, "/treatment-pages/by-path/x"));
  assert.deepEqual(out.data.treatmentPage.faq.items.map((i: any) => i.text), ["2 bis 3", "3 bis 7"]);
});

test("Liste: kein Standortname mit scope *, keine verbotenen Woerter", () => {
  const STADT = /Köln|Berlin|Düsseldorf|Duisburg|Aachen|Leipzig|Mönchengladbach|Recklinghausen|Kaiserslautern|Arcaden|Minto|Palais|Aquis|Höfe|Gesundbrunnen|K in Lautern|Forum/;
  for (const p of PAIRS) {
    if (p.scope === "*") assert.ok(!STADT.test(p.find + p.replace), `${p.pathKey}: ${p.find}`);
    assert.ok(!/MYH\s?&\s?B|(?:Ärzt|Kund|Berater|Patient)innen|Kundin/.test(p.replace), `${p.pathKey}: ${p.replace}`);
    assert.notEqual(p.find, p.replace);
  }
});

test("Euro mit normalem oder geschuetztem Leerzeichen", () => {
  const pairs: TextCorrection[] = [{ pathKey: "x", scope: "*", find: "Baby Botox ab 199,99 €", replace: "Barbie Botox" }];
  const page = { data: { answer: "Die Kosten für Baby Botox ab 199,99 € hängen ab" } };
  const out = applyTextCorrections(page, correctionsFor(pairs, "/treatment-pages/by-path/x"));
  assert.equal(out.data.answer, "Die Kosten für Barbie Botox hängen ab");
});
