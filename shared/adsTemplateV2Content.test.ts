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
  adsV2AtLocation,
  adsV2ContentKeys,
  adsV2HasGuarantee,
  adsV2PriceInclusion,
  adsV2Zones,
  adsV2Emphasize,
  adsV2HowParts,
  adsV2Objections,
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
  assert.equal(adsV2Terms("fettwegspritze"), null);
  assert.deepEqual(adsV2Facts("fettwegspritze"), []);
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
  assert.equal(h.prices.replace(/\u00a0/g, " "), "Preise für die Stirnfalte in den Köln Arcaden");
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
  assert.deepEqual(adsV2ZoneTiles(LIPPEN, "koeln", "koeln-arcaden").map((t) => t.key), ["lippenkorrektur", "lipflip", "nasolabialfalte"]);
  assert.deepEqual(adsV2ZoneTiles("fettwegspritze", "koeln", "koeln-arcaden"), []);
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
    for (const [kind, c] of [
      ...set.heroes.map((x) => ["hero", x] as const),
      ...[...set.carousel, ...(set.feedback ?? [])].map((x) => ["karussell", x] as const),
    ]) {
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

// ---------------------------------------------------------------- alle Behandlungen (01.10.2026)

const ALL = adsV2ContentKeys();
const STRICT = /botox|btx|botulinum|vorher.{0,5}nachher|before|kostenlos absagen|ärztlich geprüft|paket|garantiert|heilt|heilung|schmerzfrei|stärkt (das|dein) immun|entgift/i;

test("Alle Behandlungen: Begriffe, Steckbrief, Zeitachse, 7 FAQ, Nachsorge, Kacheln", () => {
  assert.equal(ALL.length, 39);
  for (const key of ALL) {
    const t = adsV2Terms(key)!;
    assert.ok(t, key);
    const sentences = t.howItWorks.split(/(?<=\.)\s/).length;
    assert.ok(sentences >= 2 && sentences <= 3, `${key}: Wirkweise ${sentences} Saetze`);
    const facts = adsV2Facts(key);
    assert.ok(facts.length >= 6 && facts.length <= 7, `${key}: ${facts.length} Steckbrief-Zeilen`);
    assert.equal(adsV2Timeline(key).length, 4, key);
    assert.equal(adsV2FaqsV2(key).length, 7, key);
    const questions = adsV2FaqsV2(key).map((f) => f.question);
    assert.equal(new Set(questions).size, 7, `${key}: doppelte Frage`);
    assert.ok(questions.some((q) => /Nebenwirkungen/.test(q)), `${key}: Nebenwirkungen`);
    const n = adsV2Aftercare(key).length;
    assert.ok(n >= 5 && n <= 7, `${key}: ${n} Nachsorge`);
    const tiles = adsV2ZoneTiles(key, "berlin", "gesundbrunnencenter");
    assert.ok(tiles.length >= 1 && tiles.length <= 3, `${key}: ${tiles.length} Kacheln`);
    for (const tile of tiles) {
      assert.match(tile.href, /^\/standorte\/berlin\/gesundbrunnencenter\/[a-z-]+\/[a-z0-9-]+$/);
      assert.ok(ALL.includes(tile.href.split("/").slice(4).join("/")), tile.href);
    }
    for (const text of allTexts(key)) assert.doesNotMatch(text, STRICT, `${key}: ${text}`);
  }
});

test("Behandlungsbegriff in jeder H2, alle Behandlungen", () => {
  for (const key of ALL) {
    const t = adsV2Terms(key)!;
    const h = adsV2Headings(t, "Forum Duisburg");
    const words = [t.label, t.treatment, t.object].join(" ").split(/[\s-]+/).filter((w) => w.length > 3);
    for (const [k, v] of Object.entries(h)) {
      assert.ok(words.some((w) => v.includes(w)), `${key} ${k}: ${v}`);
    }
  }
});

test("Infusionen: keine Wirkversprechen, keine Nachbehandlung, Garantie als Nachkontrolle und Beratung", () => {
  for (const key of ALL.filter((k) => k.startsWith("infusionen/"))) {
    const keys = adsV2Facts(key).map((f) => f.key);
    assert.ok(!keys.includes("wirkung") && !keys.includes("haltbarkeit"), key);
    const all = allTexts(key).join(" ");
    assert.doesNotMatch(all, /Nachbehandlung|Immunsystem|Abwehr/, key);
    assert.match(all, /kostenlose Nachkontrolle und Beratung \(Zufriedenheitsgarantie\)/, key);
    assert.match(adsV2FaqsV2(key).map((f) => f.answer).join(" "), /Behandlung nur durch Ärztinnen und Ärzte/, key);
    assert.equal(adsV2HasGuarantee(key), true);
    assert.equal(adsV2PriceInclusion(key), "Inklusive ärztlichem Vorgespräch und Nachkontrolle.");
  }
  assert.equal(adsV2PriceInclusion(STIRN), "Inklusive Beratung und Nachkontrolle.");
});

test("Zufriedenheitsgarantie je Kategorie in Zeitachse und FAQ", () => {
  const all = (k: string) => allTexts(k).join(" ");
  for (const key of ALL) assert.match(all(key), /Zufriedenheitsgarantie/, key);
  assert.match(all(STIRN), /Nachbehandlung nötig, ist sie kostenlos/);
  assert.match(all(LIPPEN), /Korrekturen der Form sind inklusive/);
  assert.match(all(LIPPEN), /weiteren ml nach Preisliste/);
  assert.doesNotMatch(all("skinbooster/profhilo"), /Nachbehandlung/);
  assert.doesNotMatch(all("hyaluron/hylase"), /Nachbehandlung|weitere ml/);
});

test("Standort-Ueberschrift mit Praeposition, Name ohne Umbruch", () => {
  const t = adsV2Terms("skinbooster/profhilo")!;
  const nb = (s: string) => s.replace(/\u00a0/g, " ").replace(/\u2011/g, "-");
  assert.equal(nb(adsV2Headings(t, "Düsseldorf Arcaden").location), "So findest du uns – deine Profhilo-Behandlung in den Düsseldorf Arcaden");
  assert.equal(nb(adsV2AtLocation("Gesundbrunnen-Center")), "im Gesundbrunnen-Center");
  assert.equal(nb(adsV2AtLocation("Minto")), "im Minto");
  assert.equal(nb(adsV2AtLocation("Höfe am Brühl")), "in den Höfen am Brühl");
  assert.equal(nb(adsV2AtLocation("Neu Center")), "am Standort Neu Center");
  assert.doesNotMatch(adsV2AtLocation("Köln Arcaden").split("den ")[1]!, / /);
});

test("Kacheln: jede mit Bild (Clip-Poster)", () => {
  for (const key of ALL) {
    for (const tile of adsV2ZoneTiles(key, "berlin", "gesundbrunnencenter")) {
      assert.ok(tile.photo && existsSync(`public${tile.photo}`), `${key} -> ${tile.key}`);
    }
  }
});

test("Behandlungsspezifische Angaben", () => {
  const f = (key: string) => Object.fromEntries(adsV2Facts(key).map((x) => [x.key, x.value]));
  assert.equal(f("muskelrelaxans/masseter").haltbarkeit, "ca. 4–6 Monate");
  assert.equal(f("muskelrelaxans/lipflip").haltbarkeit, "ca. 2–3 Monate");
  assert.equal(f("hyaluron/jawline").haltbarkeit, "ca. 9–12 Monate");
  assert.equal(f("hyaluron/full-face-hyaluron").dauer, "60–90 Minuten");
  assert.match(String(f("skinbooster/profhilo").sitzungen), /2/);
  assert.match(String(f("anti-haarausfall/prp-haartherapie").dauer), /Blutabnahme/);
  assert.match(adsV2FaqsV2("hyaluron/hylase").map((x) => x.answer).join(" "), /allergisch/);
  assert.doesNotMatch(allTexts("hyaluron/hylase").join(" "), /Hylase/);
  assert.match(adsV2FaqsV2("muskelrelaxans/masseter").map((x) => x.answer).join(" "), /Kauen/);
  assert.match(adsV2FaqsV2("skinbooster/polynukleotide-lachssperma").map((x) => x.answer).join(" "), /Fisch/);
});

test("Neue Zonenbilder: vorhanden, < 15 KB, title/desc, je Behandlung passend", () => {
  for (const z of adsV2Zones()) {
    const img = adsV2ZoneImage(z)!;
    const file = `public${img.src}`;
    assert.ok(existsSync(file), file);
    const svg = readFileSync(file, "utf8");
    assert.ok(svg.length < 15_000, file);
    assert.match(svg, /<title id="t">[^<]+<\/title><desc id="d">[^<]+<\/desc>/, file);
    assert.doesNotMatch(svg, /botox|btx/i);
  }
  assert.equal(adsV2Terms("hyaluron/jawline")!.zone, "jawline");
  assert.equal(adsV2Terms("muskelrelaxans/masseter")!.zone, "masseter");
  assert.equal(adsV2Terms("skinbooster/profhilo")!.zone, undefined);
  assert.equal(adsV2Terms("infusionen/relax-infusion")!.zone, undefined);
});

// ---------------------------------------------------------------- Agentur-Feedback (01.10.2026)

const FLOSKELN = /behutsam|sanft|harmonisch|Atmosphäre/i;

test("Agentur: keine Leerformeln in Unterzeile, Wirkweise, Zeitachse, FAQ", () => {
  for (const key of ALL) {
    for (const text of allTexts(key)) assert.doesNotMatch(text, FLOSKELN, `${key}: ${text}`);
  }
  assert.equal(
    adsV2Terms(LIPPEN)!.subline,
    "Weiche, natürlich betonte Lippen – von Ärztinnen und Ärzten behandelt",
  );
});

test("Agentur: Hervorhebung - Text bleibt gleich, kurze Texte unveraendert, hoechstens 4 fett", () => {
  const long =
    "Nach 14 Tagen gibt es eine kostenlose Nachkontrolle. Korrekturen der Form sind inklusive (Zufriedenheitsgarantie). Möchtest du mehr Volumen, wird das Material nach Preisliste berechnet.";
  const parts = adsV2Emphasize(long);
  assert.equal(parts.map((p) => p.text).join(""), long);
  const strong = parts.filter((p) => p.strong).map((p) => p.text);
  assert.deepEqual(strong, ["14 Tagen", "kostenlose Nachkontrolle", "Zufriedenheitsgarantie", "nach Preisliste berechnet"]);
  assert.deepEqual(adsV2Emphasize("Kurz und kostenlos."), [{ text: "Kurz und kostenlos.", strong: false }]);
  // nur ganze Woerter
  assert.equal(
    adsV2Emphasize("Sofortbild ".repeat(20), { minChars: 0 }).some((p) => p.strong),
    false,
  );
  for (const key of ALL) {
    const how = adsV2HowParts(key);
    assert.equal(how.map((p) => p.text).join(""), adsV2Terms(key)!.howItWorks, key);
    const n = how.filter((p) => p.strong).length;
    assert.ok(n >= 1 && n <= 4, `${key}: ${n} fette Stellen`);
  }
});

test("Agentur: Einwaende je Art, ohne Heilversprechen, Hyaluron ohne kostenloses Nachspritzen", () => {
  for (const key of ALL) {
    const a = adsV2Objections(key, { price: "ab 119,99 €*", discountPct: 20 });
    assert.equal(a.length, 5, key);
    for (const o of a) {
      assert.doesNotMatch(`${o.question} ${o.answer}`, STRICT, `${key}: ${o.answer}`);
      assert.doesNotMatch(o.answer, FLOSKELN, key);
    }
    // Zelgai 05.10.2026: Preis zuerst; Klarna/PayPal stehen im aufklappbaren
    // "So funktioniert die Ratenzahlung" (Page.vue), nicht mehr im Satz
    assert.match(a.find((o) => o.key === "price")!.answer, /zahlst du ab 119,99 €\* – die 20 % Rabatt sind darin schon abgezogen/);
    assert.match(a.find((o) => o.key === "price")!.answer, /in Raten zahlen\? Das geht über einen Gutschein\./);
    assert.match(a.find((o) => o.key === "info")!.answer, /kostenlos und unverbindlich/);
    // Variante ohne Rabatt: keine Rabattbotschaft
    const b = adsV2Objections(key, { price: "ab 149,99 €", discountPct: null });
    assert.doesNotMatch(b.map((o) => o.answer).join(" "), /Rabatt|Neukund|\*/, key);
  }
  const ha = adsV2Objections(LIPPEN).map((o) => o.answer).join(" ");
  assert.match(ha, /nach Preisliste berechnet/);
  assert.doesNotMatch(ha, /kostenlos(e|es)? (nachspritz|Nachbehandlung)/i);
  assert.match(adsV2Objections(STIRN).map((o) => o.answer).join(" "), /kostenloser Nachbehandlung/);
  assert.match(
    adsV2Objections("skinbooster/profhilo").map((o) => o.answer).join(" "),
    /Kostenlose Nachkontrolle und Beratung innerhalb von 14 Tagen/,
  );
  assert.match(adsV2Objections(STIRN).find((o) => o.key === "pain")!.answer, /Betäub|feinen Nadeln/);
});
