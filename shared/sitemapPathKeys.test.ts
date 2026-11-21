import { test } from "node:test";
import assert from "node:assert/strict";
import { withAncestorPathKeys } from "./sitemapPathKeys.ts";

test("Eltern-Seite kommt dazu, wenn nur Unterseiten verknüpft sind", () => {
  assert.deepEqual(withAncestorPathKeys(["skinbooster/profhilo", "skinbooster/lumi-face"]), ["skinbooster", "skinbooster/profhilo", "skinbooster/lumi-face"]);
});

test("keine Dubletten, leere Werte fallen weg", () => {
  assert.deepEqual(withAncestorPathKeys(["botox", "botox/stirnfalte", null, "", "botox"]), ["botox", "botox/stirnfalte"]);
});
