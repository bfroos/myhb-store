import { test } from "node:test";
import assert from "node:assert/strict";
import {
  META_PAGE_SPLIT_SCRIPT,
  META_PAGE_SPLIT_SHARE,
  metaSplitDecision,
  metaSplitTarget,
} from "./metaPageSplit.ts";

test("metaSplitTarget: nur die beiden alten Meta-Seiten", () => {
  assert.equal(metaSplitTarget("/p/botox-meta-rabatt"), "/aktion/botox");
  assert.equal(metaSplitTarget("/p/lippen-meta-rabatt/"), "/aktion/lippen");
  assert.equal(metaSplitTarget("/p/neukundenrabatt"), null);
  assert.equal(metaSplitTarget("/aktion/botox"), null);
});

test("metaSplitDecision: 20 % neu, erzwingen per ?split=", () => {
  assert.equal(META_PAGE_SPLIT_SHARE, 0.2);
  assert.equal(metaSplitDecision("/p/botox-meta-rabatt", "", 0.1), "neu");
  assert.equal(metaSplitDecision("/p/botox-meta-rabatt", "", 0.5), "alt");
  assert.equal(metaSplitDecision("/p/botox-meta-rabatt", "?split=neu", 0.9), "neu");
  assert.equal(metaSplitDecision("/p/botox-meta-rabatt", "?split=alt", 0.01), "alt");
  assert.equal(metaSplitDecision("/p/agb", "", 0.01), null);
});

test("META_PAGE_SPLIT_SCRIPT: leitet mit Query weiter bzw. markiert", () => {
  const run = (path: string, search: string, roll: number) => {
    const calls: string[] = [];
    const location = {
      pathname: path, search, hash: "#x",
      replace: (u: string) => calls.push(`replace ${u}`),
    };
    const history = { state: null, replaceState: (_s: unknown, _t: string, u: string) => calls.push(`mark ${u}`) };
    const Math_ = { ...Math, random: () => roll };
    new Function("location", "history", "Math", "URLSearchParams", META_PAGE_SPLIT_SCRIPT)(
      location, history, Math_, URLSearchParams,
    );
    return calls;
  };
  assert.deepEqual(run("/p/botox-meta-rabatt", "?fbclid=abc&utm_source=meta", 0.05), [
    "replace /aktion/botox?fbclid=abc&utm_source=meta&split=neu#x",
  ]);
  assert.deepEqual(run("/p/lippen-meta-rabatt", "?fbclid=abc", 0.7), [
    "mark /p/lippen-meta-rabatt?fbclid=abc&split=alt#x",
  ]);
  assert.deepEqual(run("/p/lippen-meta-rabatt", "?split=alt", 0.01), []);
  assert.deepEqual(run("/p/agb", "", 0.01), []);
});
