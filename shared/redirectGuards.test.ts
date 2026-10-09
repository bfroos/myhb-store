import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  LOCALE_PREFIXES,
  PROTECTED_REDIRECT_PATHS,
  isProtectedRedirectPath,
  normalizeRedirectPath,
} from "./redirectGuards.ts";

const root = new URL("../", import.meta.url);
const readJson = (path: string) =>
  JSON.parse(readFileSync(new URL(path, root), "utf8")) as Array<{
    from?: string | null;
    to?: string | null;
    code?: number;
  }>;

test("Startseiten aller Sprachversionen sind geschuetzt", () => {
  for (const path of ["/", "/en", "/tr", "/ar", "/fr", "/nl"]) {
    assert.equal(isProtectedRedirectPath(path), true, path);
  }
});

test("Schreibweisen der Shopify-Altlast treffen ebenfalls /tr", () => {
  for (const path of ["/tr/", "/TR", "/tr?page=2", "https://www.myhealthandbeauty.app/tr/"]) {
    assert.equal(isProtectedRedirectPath(path), true, path);
  }
});

test("Unterseiten und Alt-URLs bleiben umleitbar bzw. 410", () => {
  for (const path of [
    "/tr/cart/update",
    "/tr/pages/randevu-al",
    "/tr/collections/all",
    "/en/products/myh-b-gift-card",
    "/tracking",
    "/trx",
    "/standorte",
  ]) {
    assert.equal(isProtectedRedirectPath(path), false, path);
  }
});

test("normalizeRedirectPath entspricht server/utils/redirects.ts", () => {
  assert.equal(normalizeRedirectPath("/tr/"), "/tr");
  assert.equal(normalizeRedirectPath("tr"), "/tr");
  assert.equal(normalizeRedirectPath("/collections/all?page=6"), "/collections/all");
  assert.equal(normalizeRedirectPath(""), "/");
  assert.equal(normalizeRedirectPath("/botox%C2%AE"), "/botox®");
});

test("LOCALE_PREFIXES deckt alle Sprachen aus nuxt.config.ts ab", () => {
  const config = readFileSync(new URL("nuxt.config.ts", root), "utf8");
  const i18nBlock = config.slice(config.indexOf("i18n:"), config.indexOf("pages:"));
  const codes = [...i18nBlock.matchAll(/code:\s*"([a-z]{2})"/g)].map((m) => m[1]);
  assert.ok(codes.includes("de"), "de muss Standardsprache sein");
  assert.deepEqual(
    codes.filter((code) => code !== "de").sort(),
    [...LOCALE_PREFIXES].sort(),
  );
  assert.equal(PROTECTED_REDIRECT_PATHS.size, codes.length);
});

test("einzige Startseiten-Quelle in den JSON-Dateien ist die bekannte Shopify-Altlast /tr/", () => {
  // Der Eintrag {from:"/tr/", to:null, code:410} (bf2ed4c) bleibt vorerst in
  // redirects.json (Datei 317 KB, Bereinigung als eigener Commit), wird aber
  // vom Guard in server/utils/redirects.ts ignoriert. Jede weitere
  // Startseiten-Quelle laesst diesen Test fehlschlagen.
  const hits: string[] = [];
  for (const file of ["server/assets/redirects.json", "server/assets/redirects-koeln.json"]) {
    for (const item of readJson(file)) {
      if (item.from && isProtectedRedirectPath(item.from)) hits.push(`${file}:${item.from}`);
    }
  }
  assert.deepEqual(hits, ["server/assets/redirects.json:/tr/"]);
});

test("absichtliche 410-Eintraege bleiben erhalten", () => {
  const goneEntries = readJson("server/assets/redirects.json").filter(
    (item) => item.code === 410 && item.from,
  );
  // 80 Eintraege am 08.10.2026 (inkl. /tr/, der nur per Guard ignoriert
  // wird). Neue 410 sind erlaubt, ein stilles Wegfallen der bestehenden nicht.
  assert.ok(goneEntries.length >= 80, `nur ${goneEntries.length} 410-Eintraege`);
  const gone = new Set(
    goneEntries.map((item) => normalizeRedirectPath(item.from as string)),
  );
  for (const path of ["/tr/cart/update", "/tr/pages/randevu-al", "/pages/contact", "/ar/cart/update"]) {
    assert.equal(gone.has(path), true, path);
  }
});
