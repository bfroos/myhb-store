import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hatHautanalyseBlock, hautanalyseDeeplink, seitenSlug } from "./hautanalyseCta.ts";

describe("hautanalyseCta (myhb-os#1445)", () => {
  it("Block auf messbaren Themen", () => {
    for (const p of ["botox", "botox/stirnfalte", "botox/zornesfalte", "botox/kraehenfuesse", "hyaluron/nasolabialfalte", "skinbooster/profhilo"]) {
      assert.ok(hatHautanalyseBlock(p), p);
    }
  });

  it("kein Block bei Mundpartie, Marionettenfalten, Straffheit, Doppelkinn und fremden Themen", () => {
    for (const p of ["hyaluron/plisseefalten", "hyaluron/marionettenfalten", "fettwegspritze/lemon-bottle-doppelkinn", "schoenheitsoperationen/facelift", "botox/hyperhidrose-starkes-schwitzen", "hyaluron/lippen-aufspritzen", "", null]) {
      assert.ok(!hatHautanalyseBlock(p), String(p));
    }
  });

  it("Deeplink traegt die Quelle je Seite", () => {
    const url = new URL(hautanalyseDeeplink(seitenSlug("botox/stirnfalte")!));
    assert.equal(url.origin + url.pathname, "https://app.myhealthandbeauty.com/hautanalyse");
    assert.equal(url.searchParams.get("utm_content"), "stirnfalte");
    assert.equal(url.searchParams.get("utm_medium"), "behandlungsseite");
    assert.equal(new URL(hautanalyseDeeplink("startseite", "startseite")).searchParams.get("utm_medium"), "startseite");
  });
});
