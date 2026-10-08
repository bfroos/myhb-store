import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AACHEN_LIPS_TARGET,
  adsRedirectTarget,
  legacyPageRedirect,
  needsAdsRedirect,
} from "./adsRedirects.ts";

const adsPathKeys = new Set([
  "muskelrelaxans",
  "muskelrelaxans/zornesfalte",
  "muskelrelaxans/lachfalten-rabatt",
  "muskelrelaxans/baby-muskelrelaxans",
  "hyaluron/lippen-aufspritzen",
]);

test("Aachen-Lippenseite auf beiden Domains", () => {
  for (const p of [
    "/aachen/lip-filler",
    "/aachen/lip-filler/",
    "/lip-filler",
    "/standorte/aachen/lip-filler",
    "/standorte/aachen/aquis-plaza/lip-filler",
  ]) {
    assert.equal(legacyPageRedirect(p), AACHEN_LIPS_TARGET, p);
    assert.equal(adsRedirectTarget(p), AACHEN_LIPS_TARGET, p);
  }
  assert.equal(legacyPageRedirect("/standorte/aachen/aquis-plaza/hyaluron/lippen-aufspritzen"), null);
});

test("Geloeschte Landingpages (TSEO-04) auf die echte Seite", () => {
  assert.equal(legacyPageRedirect("/lp/lippen-aachen"), AACHEN_LIPS_TARGET);
  assert.equal(adsRedirectTarget("/lp/lippen-aachen"), AACHEN_LIPS_TARGET);
  assert.equal(needsAdsRedirect("/lp/lippen-aachen"), true);
  assert.equal(
    legacyPageRedirect("/lp/botox-zornesfalte-koeln"),
    "/standorte/koeln/koeln-arcaden/botox/zornesfalte",
  );
  // go.: direkt auf Muskelrelaxans, keine zweite Weiterleitung
  assert.equal(
    adsRedirectTarget("/lp/botox-zornesfalte-koeln"),
    "/standorte/koeln/koeln-arcaden/muskelrelaxans/zornesfalte",
  );
});

test("Blog auf go. aus, alle Sprachen", () => {
  for (const p of ["/blog", "/blog/", "/blog/c/botox", "/blog/p/2", "/en/blog/x", "/ar/mudawwana"]) {
    assert.equal(adsRedirectTarget(p), "/behandlungen", p);
  }
  assert.equal(adsRedirectTarget("/blogger"), null);
});

test("Botox-Pfade auf Muskelrelaxans", () => {
  assert.equal(adsRedirectTarget("/p/botox-kosten"), "/preise");
  assert.equal(adsRedirectTarget("/p/botox-meta-rabatt"), "/behandlungen/muskelrelaxans");
  assert.equal(adsRedirectTarget("/produkte/botox/botox"), "/behandlungen/muskelrelaxans");
  assert.equal(adsRedirectTarget("/behandlungen/botox", { adsPathKeys }), "/behandlungen/muskelrelaxans");
  assert.equal(
    adsRedirectTarget("/behandlungen/botox/zornesfalte", { adsPathKeys }),
    "/behandlungen/muskelrelaxans/zornesfalte",
  );
  assert.equal(
    adsRedirectTarget("/behandlungen/botox/lachfalten", { adsPathKeys }),
    "/behandlungen/muskelrelaxans/lachfalten-rabatt",
  );
  assert.equal(
    adsRedirectTarget("/behandlungen/botox/baby-botox", { adsPathKeys }),
    "/behandlungen/muskelrelaxans/baby-muskelrelaxans",
  );
  assert.equal(
    adsRedirectTarget("/behandlungen/botox/3-zonen-botox-preise", { adsPathKeys }),
    "/behandlungen/muskelrelaxans",
  );
  // ohne Strapi-Daten: Uebersicht statt einer vielleicht fehlenden Seite
  assert.equal(adsRedirectTarget("/behandlungen/botox/zornesfalte"), "/behandlungen/muskelrelaxans");
  assert.equal(adsRedirectTarget("/en/treatments/botox"), "/behandlungen/muskelrelaxans");
  assert.equal(adsRedirectTarget("/p/Browlift_mit_BTX_Aachen"), "/behandlungen/muskelrelaxans");
});

test("Standort-Botox-Pfade", () => {
  const locationPathKeys = new Set(["muskelrelaxans", "muskelrelaxans/zornesfalte"]);
  assert.equal(
    adsRedirectTarget("/standorte/koeln/koeln-arcaden/botox/zornesfalte", { locationPathKeys }),
    "/standorte/koeln/koeln-arcaden/muskelrelaxans/zornesfalte",
  );
  assert.equal(
    adsRedirectTarget("/standorte/koeln/koeln-arcaden/botox/masseter", { locationPathKeys }),
    "/standorte/koeln/koeln-arcaden/muskelrelaxans",
  );
  assert.equal(
    adsRedirectTarget("/standorte/koeln/koeln-arcaden/botox", { locationPathKeys: new Set(["hyaluron"]) }),
    "/standorte/koeln/koeln-arcaden",
  );
  assert.equal(
    adsRedirectTarget("/standorte/koeln/koeln-arcaden/botox"),
    "/standorte/koeln/koeln-arcaden",
  );
});

test("Nicht betroffen", () => {
  for (const p of [
    "/",
    "/behandlungen/muskelrelaxans/zornesfalte",
    "/p/lippen-meta-rabatt",
    "/_ipx/w_800/https://media/Botox_x.png",
    "/api/strapi/pages/by-slug/botox-kosten",
    "/_nuxt/botox.js",
    "/standorte/koeln/koeln-arcaden/hyaluron/lippen-aufspritzen",
    "/p/subtext", // "btx" nur als Wortteil
  ]) {
    assert.equal(needsAdsRedirect(p), false, p);
    assert.equal(adsRedirectTarget(p, { adsPathKeys }), null, p);
  }
});
