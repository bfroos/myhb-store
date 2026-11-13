import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hatHautanalyseBlock, hautanalyseDeeplink, hautanalysePrototypZiel, seitenSlug } from "./hautanalyseCta.ts";

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

  it("leitet den alten Prototyp /hautanalyse in die App um (myhb-os#643)", () => {
    for (const p of ["/hautanalyse", "/hautanalyse/", "/en/hautanalyse", "/Hautanalyse"]) {
      const url = new URL(hautanalysePrototypZiel(p)!);
      assert.equal(url.origin + url.pathname, "https://app.myhealthandbeauty.com/hautanalyse", p);
      assert.equal(url.searchParams.get("utm_medium"), "prototyp");
    }
    const mitHerkunft = new URL(hautanalysePrototypZiel("/hautanalyse", "?utm_source=meta&utm_content=reel1")!);
    assert.equal(mitHerkunft.searchParams.get("utm_source"), "meta");
    assert.equal(mitHerkunft.searchParams.get("utm_content"), "reel1");
    assert.equal(mitHerkunft.searchParams.get("utm_medium"), null);
    for (const p of ["/", "/behandlungen/botox", "/hautanalyse-test", "/ratgeber/hautanalyse", "/api/hautanalyse/analyse"]) {
      assert.equal(hautanalysePrototypZiel(p), null, p);
    }
  });
});
