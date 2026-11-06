import { test } from "node:test";
import assert from "node:assert/strict";
import bilder from "./blogBilder.json" with { type: "json" };
import { blogBilder } from "./blogBilder.ts";

test("Artikelbilder: je Artikel hoechstens zwei, mit Alt-Text und Bild-URL", () => {
  for (const [slug, liste] of Object.entries(bilder as Record<string, any[]>)) {
    assert.ok(liste.length <= 2, slug);
    for (const b of liste) {
      assert.match(b.url, /^https:\/\/media\./, slug);
      assert.match(b.mime, /^image\//, slug);
      assert.ok(b.alt && !/kundin|innen\b|myhb/i.test(b.alt), `${slug}: ${b.alt}`);
    }
  }
  assert.equal(blogBilder("wann-wirkt-botox").length, 2);
  assert.deepEqual(blogBilder("gibt-es-nicht"), []);
});
