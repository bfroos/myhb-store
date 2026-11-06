import { test } from "node:test";
import assert from "node:assert/strict";
import intros from "../server/assets/city-intros.json" with { type: "json" };
import { SEO_LOCAL_TEXT_FORBIDDEN } from "./seoLocalTexts.ts";
import { cityIntroBlocks, type CityIntro } from "./cityIntros.ts";
import { wordCount } from "./localContentGate.ts";

const all = intros as CityIntro[];
const text = (i: CityIntro) =>
  [i.headline, i.intro, ...i.paragraphs, i.linksHeadline, ...i.links, i.umlandHeadline, i.umland].join(" ");

test("alle 9 offenen Staedte haben eine Einleitung", () => {
  assert.deepEqual(
    all.map((i) => i.citySlug).sort(),
    ["aachen", "berlin", "duesseldorf", "duisburg", "kaiserslautern", "koeln", "leipzig", "moenchengladbach", "recklinghausen"],
  );
});

test("genug Text und Links nur auf Standortseiten der eigenen Stadt", () => {
  for (const i of all) {
    assert.ok(wordCount(i.paragraphs.join(" ")) >= 150, `${i.citySlug}: zu wenig Text`);
    const paths = [...text(i).matchAll(/\]\((\/[^)\s]*)\)/g)].map((m) => m[1]);
    assert.ok(paths.length >= 6, `${i.citySlug}: zu wenige Links`);
    for (const p of paths) assert.ok(p.startsWith(`/standorte/${i.citySlug}/`), `${i.citySlug}: ${p}`);
  }
});

test("Texte halten die Regeln ein", () => {
  for (const i of all) {
    const m = text(i).match(SEO_LOCAL_TEXT_FORBIDDEN);
    assert.equal(m, null, `${i.citySlug}: "${m?.[0]}"`);
  }
});

test("drei Textbloecke, Links als Liste", () => {
  const b = cityIntroBlocks(all[0]);
  assert.equal(b.length, 3);
  assert.equal(b[1].content[0].type, "list");
  assert.deepEqual(cityIntroBlocks(null), []);
});
