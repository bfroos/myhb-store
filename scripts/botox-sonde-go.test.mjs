// Offline-Tests der Botox-Sonde (scripts/botox-sonde-go.mjs). Die Live-
// Positivkontrolle gegen www laeuft im Skript selbst vor jedem Lauf.
import { test } from "node:test";
import assert from "node:assert/strict";
import { findTerms, internalLinks, renderReport } from "./botox-sonde-go.mjs";

const PAGE = "https://go.example.test/standorte/koeln/x/muskelrelaxans/zornesfalte";
const wrap = (head, body) => `<!doctype html><html><head>${head}</head><body>${body}</body></html>`;

test("sichtbarer Text mit Botox wird gefunden, mit Ausschnitt", () => {
  const f = findTerms(wrap("<title>X</title>", "<p>Unser Botox&reg; wirkt schnell.</p>"), PAGE);
  assert.equal(f.length, 1);
  assert.equal(f[0].term, "Botox");
  assert.equal(f[0].source, "sichtbarer Text");
  assert.match(f[0].snippet, /Unser Botox® wirkt/);
});

test("Negativkontrolle: Botox nur in Skript, Payload, JSON-LD, Style, Kommentar -> kein Treffer", () => {
  const html = wrap(
    `<style>.botox{color:red}</style><script type="application/ld+json">{"name":"Botox"}</script>`,
    `<!-- Botox --><p>Muskelrelaxans gegen Zornesfalte</p>
     <script>window.__NUXT__={pathKeys:["muskelrelaxans/baby-botox"]}</script>
     <script type="application/json" id="__NUXT_DATA__">["botox/lachfalten","BTX"]</script>
     <section id="botox" class="botox" data-key="botox">ok</section>`,
  );
  assert.deepEqual(findTerms(html, PAGE), []);
});

test("Title, Meta, alt und Video-URL werden gewertet", () => {
  const html = wrap(
    `<title>Botox Köln</title><meta name="description" content="Faltenglättung mit Botox">
     <meta property="og:image" content="https://media.x/DI_Christine_Botox_Zornesfalte_abc1234567.jpg">
     <meta name="viewport" content="botox">`,
    `<img alt="Vorher Botox" src="/a.jpg"><video src="https://media.x/Video_BTX_Stirn_0123456789.mp4#t=1"></video>`,
  );
  const f = findTerms(html, PAGE);
  const sources = f.map((x) => x.source);
  assert.ok(sources.includes("<title>"));
  assert.ok(sources.includes("<meta description>"));
  assert.ok(sources.includes("<img alt>"));
  assert.ok(sources.includes("<meta og:image>"));
  assert.ok(sources.includes("<video src>"));
  assert.ok(!sources.some((s) => s.includes("viewport")));
  // Mediendateinamen tragen Vornamen: nur Begriff + Hash ins Issue.
  const media = f.find((x) => x.source === "<meta og:image>");
  assert.doesNotMatch(media.snippet, /Christine/);
  assert.match(media.snippet, /abc1234567/);
  assert.equal(f.find((x) => x.source === "<video src>").term, "BTX");
});

test("BTX nur als eigenes Wort", () => {
  assert.equal(findTerms(wrap("", "<p>Wir nutzen BTX.</p>"), PAGE).length, 1);
  assert.equal(findTerms(wrap("", "<p>ABTX und BTXS und 2BTX</p>"), PAGE).length, 0);
});

test("Seiten-URL und Links mit botox zaehlen, Query-Varianten werden zusammengefasst", () => {
  const html = wrap("", `<a href="/produkte/botox/botox?v=1-zone">1</a><a href="/produkte/botox/botox?v=2-zonen">2</a>`);
  const f = findTerms(html, "https://go.example.test/p/botox-kosten");
  assert.equal(f.length, 2);
  assert.ok(f.some((x) => x.source === "Seiten-URL"));
  assert.ok(f.some((x) => x.source === "<a href>" && x.snippet === "/produkte/botox/botox"));
});

test("interne Links: gleicher Host, keine Sprachpraefixe, keine Assets", () => {
  const html = wrap(
    "",
    `<a href="/preise">p</a><a href="/en/prices">e</a><a href="https://www.example.test/x">w</a>
     <a href="/_nuxt/a.js">j</a><a href="tel:0221">t</a><a href="/standorte/koeln/?a=1#x">s</a>`,
  );
  assert.deepEqual(internalLinks(html, "https://go.example.test/").sort(), [
    "https://go.example.test/preise",
    "https://go.example.test/standorte/koeln",
  ]);
});

test("Bericht schwaerzt Telefon/E-Mail und trennt Fehlabrufe von Treffern", () => {
  const pages = [
    { url: "https://go.example.test/a", finalUrl: "https://go.example.test/a", status: 200,
      findings: findTerms(wrap("", "<p>Botox-Termin unter 0221 801 423 99 oder info@example.test</p>"), "https://go.example.test/a") },
    { url: "https://go.example.test/b", status: 404, error: "HTTP 404", findings: [] },
  ];
  const r = renderReport({ base: "https://go.example.test", pages });
  assert.match(r, /mit Treffer: \*\*1\*\*/);
  assert.match(r, /Abruf fehlgeschlagen \(1\)/);
  assert.doesNotMatch(r, /801 423|info@/);
});
