import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import {
  adsV2Aftercare,
  adsV2ConsultPhoto,
  adsV2Facts,
  adsV2FaqsV2,
  adsV2Headings,
  adsV2Terms,
  adsV2Timeline,
  adsV2ZoneHint,
  adsV2ZoneImage,
  adsV2ZoneTiles,
} from "./adsTemplateV2Content.ts";
import { adsClipEntries } from "./adsClips.ts";

const STIRN = "muskelrelaxans/stirnfalte";
const LIPPEN = "hyaluron/lippen-aufspritzen";
const FORBIDDEN = /botox|btx|botulinum|vorher.{0,5}nachher|before|kostenlos absagen|ärztlich geprüft|paket/i;

function allTexts(key: string): string[] {
  const t = adsV2Terms(key)!;
  return [
    ...Object.values(t).filter((v) => typeof v === "string"),
    ...Object.values(adsV2Headings(t, "Köln Arcaden")),
    ...adsV2Facts(key).flatMap((f) => [f.label, f.value]),
    ...adsV2Timeline(key).flatMap((i) => [i.when, i.title, i.text]),
    ...adsV2FaqsV2(key).flatMap((f) => [f.question, f.answer]),
    ...adsV2Aftercare(key),
  ] as string[];
}

test("Musterseiten: Begriffe, 6 Steckbrief-Zeilen, 4 Zeitachsen-Schritte, 7-8 FAQ, 5-6 Nachsorge", () => {
  for (const key of [STIRN, LIPPEN, `${STIRN}-rabatt`]) {
    assert.ok(adsV2Terms(key), key);
    assert.equal(adsV2Facts(key).length, 6);
    assert.equal(adsV2Timeline(key).length, 4);
    const q = adsV2FaqsV2(key).length;
    assert.ok(q >= 7 && q <= 8, `${key}: ${q} FAQ`);
    const n = adsV2Aftercare(key).length;
    assert.ok(n >= 5 && n <= 6, `${key}: ${n}`);
  }
  assert.equal(adsV2Terms("hyaluron/hylase"), null);
  assert.deepEqual(adsV2Facts("hyaluron/hylase"), []);
});

test("Steckbrief-Werte nach Benjamin", () => {
  const s = Object.fromEntries(adsV2Facts(STIRN).map((f) => [f.key, f.value]));
  assert.equal(s.dauer, "20–30 Minuten");
  assert.equal(s.wirkung, "nach 3–7 Tagen");
  assert.equal(s.ergebnis, "nach 14 Tagen");
  assert.equal(s.haltbarkeit, "ca. 3–4 Monate");
  assert.equal(s.ausfall, "keine");
  const l = Object.fromEntries(adsV2Facts(LIPPEN).map((f) => [f.key, f.value]));
  assert.equal(l.wirkung, "sofort sichtbar");
  assert.equal(l.haltbarkeit, "ca. 6–12 Monate");
});

test("Behandlungsbegriff in jeder H2", () => {
  const h = adsV2Headings(adsV2Terms(STIRN)!, "Köln Arcaden");
  for (const [k, v] of Object.entries(h)) {
    assert.match(v, /Stirnfalte/, k);
  }
  assert.equal(h.steps, "So läuft deine Stirnfalten-Behandlung ab");
  assert.equal(h.prices, "Preise für die Stirnfalte in Köln Arcaden");
  const l = adsV2Headings(adsV2Terms(LIPPEN)!, "Köln Arcaden");
  for (const [k, v] of Object.entries(l)) {
    assert.match(v, /Lippe/, k);
  }
});

test("Keine verbotenen Begriffe in allen Texten", () => {
  for (const key of [STIRN, LIPPEN, "muskelrelaxans/zornesfalte", "muskelrelaxans/kraehenfuesse", "muskelrelaxans/browlift"]) {
    for (const t of allTexts(key)) assert.doesNotMatch(t, FORBIDDEN, `${key}: ${t}`);
  }
});

test("FAQ nennt Nebenwirkungen offen und Rueckgaengig-Weg", () => {
  const mr = adsV2FaqsV2(STIRN).map((f) => f.answer).join(" ");
  assert.match(mr, /Rötung/);
  assert.match(mr, /blauer Fleck/);
  assert.match(mr, /ungleichmäßig/);
  assert.match(mr, /Lid/);
  assert.match(mr, /von selbst/);
  const ha = adsV2FaqsV2(LIPPEN).map((f) => f.answer).join(" ");
  assert.match(ha, /Schwellung/);
  assert.match(ha, /Knötchen/);
  assert.match(ha, /Hyaluronidase/);
});

test("Zeitachse: Tag 0, Tag 3-7, Tag 14 mit Garantie, Auffrischen", () => {
  const t = adsV2Timeline(STIRN);
  assert.deepEqual(t.map((i) => i.when), ["Tag 0", "Tag 3–7", "Tag 14", "nach ca. 4 Monaten"]);
  assert.match(t[2]!.text, /Zufriedenheitsgarantie/);
});

test("Weitere Zonen: gegenseitig, gleicher Standort, echte go.-Seite", () => {
  const tiles = adsV2ZoneTiles(STIRN, "koeln", "koeln-arcaden");
  assert.deepEqual(tiles.map((t) => t.key), ["zornesfalte", "kraehenfuesse", "browlift"]);
  assert.equal(tiles[0]!.href, "/standorte/koeln/koeln-arcaden/muskelrelaxans/zornesfalte");
  assert.equal(tiles[2]!.image?.src, "/images/go/zonen/zone-browlift.svg");
  assert.deepEqual(adsV2ZoneTiles(LIPPEN, "koeln", "koeln-arcaden"), []);
  assert.deepEqual(adsV2ZoneTiles("muskelrelaxans/masseter", "koeln", "koeln-arcaden"), []);
  assert.equal(adsV2ZoneHint([{ note: "89,99 € je Zone" }, { note: "79,99 € je Zone" }, {}]), "ab 2 Zonen 79,99 € pro Zone*");
  assert.equal(adsV2ZoneHint([{}]), null);
});

test("Zonenbilder: vorhanden, klein, mit title/desc", () => {
  for (const z of ["stirn", "zornesfalte", "kraehenfuesse", "browlift", "lippen"] as const) {
    const img = adsV2ZoneImage(z)!;
    const file = `public${img.src}`;
    assert.ok(existsSync(file), file);
    const svg = readFileSync(file, "utf8");
    assert.ok(svg.length < 15_000);
    assert.match(svg, /<title id="t">[^<]+<\/title><desc id="d">[^<]+<\/desc>/);
    assert.match(svg, /role="img"/);
  }
});

test("Beratungsfoto: zunaechst leer", () => {
  assert.equal(adsV2ConsultPhoto(STIRN), null);
});

test("Clips: Dateien im Repo, Groessen, neutraler Name, Poster", () => {
  for (const [, set] of adsClipEntries()) {
    for (const [kind, c] of [["hero", set.hero], ...set.carousel.map((x) => ["karussell", x])] as const) {
      if (!c || !c.url.startsWith("/videos/go/")) continue;
      const f = `public${c.url}`;
      assert.ok(existsSync(f), f);
      assert.ok(existsSync(`public${c.posterUrl}`), String(c.posterUrl));
      assert.doesNotMatch(c.url + (c.caption ?? ""), /botox|btx/i);
      const max = kind === "hero" ? 600_000 : 1_200_000;
      assert.ok(statSync(f).size <= max, `${f} ${statSync(f).size}`);
    }
  }
});
