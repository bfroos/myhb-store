import { test } from "node:test";
import assert from "node:assert/strict";
import {
  anfrageZiel,
  behandlungDerAnfrage,
  behandlungFuerPfad,
  istAnfrageModal,
  isKlinikBehandlung,
  modalBehandlung,
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

test("Anfrage-Ziel: Modal mit der OP der Seite, Kategorieseite ohne", () => {
  assert.equal(anfrageZiel("schoenheitsoperationen/haartransplantation"), "modal:Haartransplantation");
  assert.equal(anfrageZiel("/schoenheitsoperationen/lidstraffung/"), "modal:Lidstraffung");
  assert.equal(anfrageZiel("schoenheitsoperationen/brustvergroesserung"), "modal:Brust-OP");
  assert.equal(anfrageZiel("schoenheitsoperationen"), "modal:");
  assert.equal(anfrageZiel(null), "modal:");
  assert.equal(istAnfrageModal("modal:Lidstraffung"), true);
  assert.equal(istAnfrageModal("/lp/op-anfrage"), false);
  assert.equal(modalBehandlung("modal:Lidstraffung"), "Lidstraffung");
  assert.equal(modalBehandlung("modal:"), null);
  assert.equal(behandlungFuerPfad("schoenheitsoperationen/unbekannt"), null);
});

test("Allgemeiner Funnel nimmt die gewaehlte OP als Behandlung", () => {
  assert.equal(behandlungDerAnfrage("Schönheits-OP", ["Lidstraffung", "Seit einigen Monaten"]), "Lidstraffung");
  assert.equal(behandlungDerAnfrage("Schönheits-OP", ["Etwas anderes"]), "Schönheits-OP");
  assert.equal(behandlungDerAnfrage("Haartransplantation", ["Brust-OP"]), "Haartransplantation");
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
