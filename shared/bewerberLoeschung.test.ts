import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cvFileIdAusUrl,
  entscheideLoeschung,
  faelligBisMs,
} from "./bewerberLoeschung.ts";

const EINGEGANGEN = "5463910623";
const ABSAGE = "5463910629";
const ERSTGESPRAECH = "5463910626";

test("reine Bewerbung ohne Bearbeitung: Kontakt wird geloescht", () => {
  assert.deepEqual(
    entscheideLoeschung({
      lifecyclestage: "lead",
      recruitingDealStages: [EINGEGANGEN],
      hatAndereDeals: false,
    }),
    { aktion: "kontakt_loeschen" },
  );
});

test("abgesagte Bewerbung wird geloescht, auch ohne Deal", () => {
  assert.equal(
    entscheideLoeschung({
      lifecyclestage: null,
      recruitingDealStages: [ABSAGE],
      hatAndereDeals: false,
    }).aktion,
    "kontakt_loeschen",
  );
  assert.equal(
    entscheideLoeschung({
      lifecyclestage: null,
      recruitingDealStages: [],
      hatAndereDeals: false,
    }).aktion,
    "kontakt_loeschen",
  );
});

test("laufender Prozess bleibt stehen, auch wenn ein zweiter Deal abgesagt ist", () => {
  const entscheidung = entscheideLoeschung({
    lifecyclestage: "lead",
    recruitingDealStages: [ABSAGE, ERSTGESPRAECH],
    hatAndereDeals: false,
  });
  assert.equal(entscheidung.aktion, "behalten");
});

test("Bestandskundin: nur die Bewerbung geht, der Kontakt bleibt", () => {
  assert.equal(
    entscheideLoeschung({
      lifecyclestage: "customer",
      recruitingDealStages: [EINGEGANGEN],
      hatAndereDeals: false,
    }).aktion,
    "nur_bewerbung_loeschen",
  );
  assert.equal(
    entscheideLoeschung({
      lifecyclestage: "lead",
      recruitingDealStages: [EINGEGANGEN],
      hatAndereDeals: true,
    }).aktion,
    "nur_bewerbung_loeschen",
  );
});

test("Datei-ID aus dem File-Manager-Link", () => {
  assert.equal(
    cvFileIdAusUrl("https://app-eu1.hubspot.com/files/148248537/?fileId=987654321"),
    "987654321",
  );
  assert.equal(cvFileIdAusUrl("https://example.com/cv.pdf"), null);
  assert.equal(cvFileIdAusUrl(null), null);
});

test("faellig bis heute Mitternacht UTC", () => {
  assert.equal(
    faelligBisMs(new Date("2027-04-19T04:00:00Z")),
    String(Date.UTC(2027, 3, 19)),
  );
});
