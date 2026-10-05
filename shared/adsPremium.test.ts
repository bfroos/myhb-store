import test from "node:test";
import assert from "node:assert/strict";
import {
  ADS_PREMIUM_PAGES,
  ADS_SECTIONS,
  adsTrackPlacement,
  depthOffset,
  isAdsPremiumPage,
  isAdsAnyPreviewPath,
  isAdsPremiumPreviewPath,
  stripAdsAnyPreview,
  resolveAdsOverrides,
  resolveHiddenSections,
  resolveSectionOrder,
  shouldEnableDepthMotion,
} from "./adsPremium.ts";

const PROFHILO = ["duesseldorf", "duesseldorf-arcaden", "skinbooster/profhilo"] as const;

test("Premium ist auf echten Seiten aus (Liste leer)", () => {
  assert.deepEqual([...ADS_PREMIUM_PAGES], []);
  assert.equal(isAdsPremiumPage(...PROFHILO), false);
  assert.equal(isAdsPremiumPage(...PROFHILO, ["duesseldorf/*/skinbooster/*"]), true);
  assert.equal(isAdsPremiumPage("koeln", "koeln-arcaden", "skinbooster/profhilo", ["duesseldorf/*/*"]), false);
});

test("Premium-Vorschau zaehlt als v2-Vorschau, Canonical auf die echte Seite", () => {
  const real = "/standorte/duesseldorf/duesseldorf-arcaden/skinbooster/profhilo";
  assert.equal(isAdsPremiumPreviewPath(`/vorschau-premium${real}`), true);
  assert.equal(isAdsPremiumPreviewPath(`/vorschau-v2${real}`), false);
  assert.equal(isAdsPremiumPreviewPath(real), false);
  assert.equal(isAdsAnyPreviewPath(`/vorschau-premium${real}`), true);
  assert.equal(isAdsAnyPreviewPath(`/vorschau-v2${real}`), true);
  assert.equal(isAdsAnyPreviewPath(real), false);
  assert.equal(stripAdsAnyPreview(`/vorschau-premium${real}`), real);
  assert.equal(stripAdsAnyPreview(`/en/vorschau-premium${real}`), `/en${real}`);
  assert.equal(stripAdsAnyPreview(`/vorschau-v2${real}`), real);
  assert.equal(stripAdsAnyPreview(real), real);
  assert.equal(stripAdsAnyPreview("/p/vorschau-premium-x"), "/p/vorschau-premium-x");
});

test("Reihenfolge: feste Abschnitte bleiben, Unbekanntes faellt weg", () => {
  assert.deepEqual(resolveSectionOrder(null), [...ADS_SECTIONS]);
  const order = resolveSectionOrder(["reviews", "final", "hero", "nonsense", "prices", "reviews"]);
  assert.equal(order[0], "hero");
  assert.equal(order[1], "clips");
  assert.equal(order[2], "trust");
  assert.equal(order[3], "reviews");
  assert.equal(order[4], "prices");
  assert.equal(order.at(-1), "final");
  assert.equal(order.length, ADS_SECTIONS.length);
  assert.equal(new Set(order).size, ADS_SECTIONS.length);
});

test("Pflicht-Abschnitte lassen sich nicht ausblenden", () => {
  const hidden = resolveHiddenSections(["hero", "trust", "prices", "final", "zones", "lounge", "x"]);
  assert.deepEqual([...hidden].sort(), ["lounge", "zones"]);
});

test("Overrides: erlaubte Texte gehen durch, Rest faellt auf v2 zurueck", () => {
  const o = resolveAdsOverrides(
    {
      heroHeadline: "  Profhilo   in Düsseldorf  ",
      heroSubline: "Mit Botox zu glatter Haut",
      headlines: [
        { key: "prices", text: "Preise in Düsseldorf" },
        { key: "final", text: "Garantiert schmerzfrei" },
        { key: "priceCards", text: "x" },
      ],
      sectionOrder: [{ section: "doctors" }],
      hiddenSections: [{ section: "prices" }, { section: "consult" }],
    },
    { goMode: true },
  );
  assert.equal(o.heroHeadline, "Profhilo in Düsseldorf");
  assert.equal(o.heroSubline, null);
  assert.deepEqual(o.headlines, { prices: "Preise in Düsseldorf" });
  assert.equal(o.order[3], "doctors");
  assert.deepEqual([...o.hidden], ["consult"]);
  const fields = o.rejected.map((r) => r.field).sort();
  assert.deepEqual(fields, ["headlines.final", "headlines.priceCards", "heroSubline"]);
  const html = resolveAdsOverrides({ heroHeadline: "<b>Jetzt</b> buchen" }, { goMode: true });
  assert.equal(html.heroHeadline, null);
  assert.equal(html.rejected[0]?.reason, "HTML oder Link");
});

test("Overrides: Markenname nur auf go. gesperrt; leer/fehlend = v2", () => {
  const www = resolveAdsOverrides({ heroHeadline: "Botox in Köln" }, { goMode: false });
  assert.equal(www.heroHeadline, "Botox in Köln");
  const empty = resolveAdsOverrides(undefined, { goMode: true });
  assert.equal(empty.heroHeadline, null);
  assert.deepEqual(empty.headlines, {});
  assert.deepEqual(empty.order, [...ADS_SECTIONS]);
  assert.equal(empty.rejected.length, 0);
  const long = resolveAdsOverrides({ heroHeadline: "x".repeat(71) }, { goMode: true });
  assert.equal(long.heroHeadline, null);
});

test("Parallaxe nur auf Desktop mit Maus, nie bei reduzierter Bewegung", () => {
  const desk = { reducedMotion: false, coarsePointer: false, viewportWidth: 1440 };
  assert.equal(shouldEnableDepthMotion(desk), true);
  assert.equal(shouldEnableDepthMotion({ ...desk, reducedMotion: true }), false);
  assert.equal(shouldEnableDepthMotion({ ...desk, coarsePointer: true }), false);
  assert.equal(shouldEnableDepthMotion({ ...desk, saveData: true }), false);
  assert.equal(shouldEnableDepthMotion({ ...desk, deviceMemory: 2 }), false);
  assert.equal(shouldEnableDepthMotion({ ...desk, viewportWidth: 430 }), false);
});

test("Versatz ist begrenzt und rund", () => {
  assert.deepEqual(depthOffset(0.5, 0.5), { x: 0, y: 0 });
  assert.deepEqual(depthOffset(1, 0), { x: 6, y: -6 });
  assert.deepEqual(depthOffset(5, -3), { x: 6, y: -6 });
  assert.deepEqual(depthOffset(Number.NaN, 0.75, 4), { x: 0, y: 2 });
});

test("Tracking-Kennungen folgen der v2-Konvention", () => {
  assert.equal(adsTrackPlacement("hero"), "v2_hero");
  assert.equal(adsTrackPlacement("prices", "card", "1-zone"), "v2_prices_card_1_zone");
  assert.equal(adsTrackPlacement("faq", "Öffnen!"), "v2_faq_ffnen");
});
