import { test } from "node:test";
import assert from "node:assert/strict";
import { stempelDomain, stempelGueltig, STEMPEL_MAX_LAENGE } from "./stempelCookie.ts";

test("Stempel mit first/last wird angenommen", () => {
  const s = JSON.stringify({ first: { utm_source: "facebook" }, last: { fbclid: "x" } });
  assert.equal(stempelGueltig(s), s);
});

test("alles andere wird verworfen", () => {
  assert.equal(stempelGueltig(undefined), null);
  assert.equal(stempelGueltig(""), null);
  assert.equal(stempelGueltig("kein json"), null);
  assert.equal(stempelGueltig("[1,2]"), null);
  assert.equal(stempelGueltig('{"foo":1}'), null);
  assert.equal(stempelGueltig(JSON.stringify({ first: { x: "a".repeat(STEMPEL_MAX_LAENGE) } })), null);
});

test("Domain nur auf der eigenen Domain", () => {
  assert.equal(stempelDomain("www.myhealthandbeauty.com"), ".myhealthandbeauty.com");
  assert.equal(stempelDomain("myhealthandbeauty.com:443"), ".myhealthandbeauty.com");
  assert.equal(stempelDomain("myhb-store-git-x.vercel.app"), undefined);
  assert.equal(stempelDomain("localhost:3000"), undefined);
  assert.equal(stempelDomain("evilmyhealthandbeauty.com"), undefined);
});
