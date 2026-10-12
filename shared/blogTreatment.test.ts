import { test } from "node:test";
import assert from "node:assert/strict";
import { blogTreatmentPathKey, shortDescription } from "./blogTreatment.ts";

test("Zuordnung Artikel -> Behandlung", () => {
  assert.equal(blogTreatmentPathKey("zornesfalte-entfernen-kosten", "botox"), "botox/zornesfalte");
  assert.equal(blogTreatmentPathKey("lip-flip-oder-hyaluron-welche-behandlung-passt-besser-zu-ihren-lippen", "hyaluron"), "botox/lipflip");
  assert.equal(blogTreatmentPathKey("lippen-aufspritzen-erfahrungen", "hyaluron"), "hyaluron/lippen-aufspritzen");
  assert.equal(blogTreatmentPathKey("mesotherapie-oder-profhilo", "skinbooster"), "skinbooster/profhilo");
  assert.equal(blogTreatmentPathKey("was-hilft-gegen-falten", "botox"), "botox");
  assert.equal(blogTreatmentPathKey("haartransplantation-im-ausland-worauf-mussen-patienten-achten", "haare"), null);
  assert.equal(blogTreatmentPathKey("bruststraffung-kosten", "schoenheitsoperationen"), null);
  assert.equal(blogTreatmentPathKey("geglucktes-opening-in-berlin", "my"), null);
});

test("Kurze Meta-Description am Wortende", () => {
  const long = "Jeder kennt diesen Moment: Du schaust morgens in den Spiegel und wirkst müde, angestrengt oder sogar verärgert, obwohl du dich eigentlich gut fühlst. Schuld ist oft die Zornesfalte.";
  const d = shortDescription(long);
  assert.ok(d.length <= 156, String(d.length));
  assert.match(d, / …$/);
});
