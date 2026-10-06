import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTreatmentTilePath } from "./locationTreatmentLinks.ts";

const ARCADEN = "koeln/koeln-arcaden";
const ARCADEN_KEYS = ["botox", "botox/masseter", "hyaluron/kinnkorrektur"];
const SIBLINGS = {
  "schoenheitsoperationen/haartransplantation": "koeln/mediapark-klinik",
};

test("am Standort verfuegbar -> lokale Arcaden-URL", () => {
  assert.equal(
    resolveTreatmentTilePath({
      pathKey: "botox/masseter",
      locationPathKey: ARCADEN,
      locationTreatmentPathKeys: ARCADEN_KEYS,
      cityTreatmentLocations: SIBLINGS,
    }),
    "/standorte/koeln/koeln-arcaden/botox/masseter",
  );
});

test("OP von der Arcaden-Seite -> MediaPark-URL, nicht national", () => {
  assert.equal(
    resolveTreatmentTilePath({
      pathKey: "schoenheitsoperationen/haartransplantation",
      locationPathKey: ARCADEN,
      locationTreatmentPathKeys: ARCADEN_KEYS,
      cityTreatmentLocations: SIBLINGS,
    }),
    "/standorte/koeln/mediapark-klinik/schoenheitsoperationen/haartransplantation",
  );
});

test("weder hier noch in der Stadt -> national", () => {
  assert.equal(
    resolveTreatmentTilePath({
      pathKey: "skinbooster/profhilo",
      locationPathKey: ARCADEN,
      locationTreatmentPathKeys: ARCADEN_KEYS,
      cityTreatmentLocations: SIBLINGS,
    }),
    "/behandlungen/skinbooster/profhilo",
  );
});

test("ohne Standort -> national; ohne Liste -> lokal (Verhalten wie bisher)", () => {
  assert.equal(
    resolveTreatmentTilePath({ pathKey: "botox" }),
    "/behandlungen/botox",
  );
  assert.equal(
    resolveTreatmentTilePath({ pathKey: "botox", locationPathKey: ARCADEN }),
    "/standorte/koeln/koeln-arcaden/botox",
  );
});
