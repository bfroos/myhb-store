import { test } from "node:test";
import assert from "node:assert/strict";
import {
  anfrageZiel,
  isKlinikBehandlung,
  KLINIK_AUSGEBLENDETE_BLOECKE,
} from "./klinik.ts";

test("OP-Typen aus Strapi sind Klinik-Behandlungen", () => {
  assert.equal(isKlinikBehandlung({ type: "abulatory" }), true);
  assert.equal(isKlinikBehandlung({ type: "operational" }), true);
  assert.equal(isKlinikBehandlung({ type: "minimally-invasive" }), false);
});

test("pathKey unter schoenheitsoperationen reicht, auch ohne type", () => {
  assert.equal(
    isKlinikBehandlung({ pathKey: "schoenheitsoperationen/haartransplantation" }),
    true,
  );
  assert.equal(isKlinikBehandlung({ pathKey: "schoenheitsoperationen" }), true);
  assert.equal(isKlinikBehandlung({ pathKey: "/schoenheitsoperationen/facelift" }), true);
  assert.equal(isKlinikBehandlung({ pathKey: "schoenheitsoperationenx" }), false);
  assert.equal(isKlinikBehandlung({ pathKey: "botox/stirnfalte" }), false);
  assert.equal(isKlinikBehandlung({}), false);
});

test("Anfrage-Ziel: Haartransplantation hat eigene Seite, sonst allgemeine OP-Anfrage", () => {
  assert.equal(
    anfrageZiel("schoenheitsoperationen/haartransplantation"),
    "/lp/haartransplantation",
  );
  assert.equal(anfrageZiel("schoenheitsoperationen/lidstraffung"), "/lp/op-anfrage");
  assert.equal(anfrageZiel(null), "/lp/op-anfrage");
});

test("Alle 20-%-Promo-Bloecke werden ausgeblendet", () => {
  for (const key of [
    "blocks.promo-banner",
    "blocks.promo-strip",
    "blocks.promo-hero",
    "blocks.promo-floating-sticker",
  ]) {
    assert.equal(KLINIK_AUSGEBLENDETE_BLOECKE.has(key), true, key);
  }
  assert.equal(KLINIK_AUSGEBLENDETE_BLOECKE.has("blocks.faq-accordion"), false);
});
