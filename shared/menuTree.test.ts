import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanMenuTree } from "./menuTree.ts";

test("verwaiste Unterseiten fliegen aus der obersten Ebene", () => {
  const items = [
    { name: "Hyaluron", pathKey: "hyaluron", children: [] },
    { name: "Hände", pathKey: "hyaluron/haende", children: [] },
    { name: "Krähenfüße", pathKey: "botox/kraehenfuesse", children: [] },
  ];
  assert.deepEqual(
    cleanMenuTree(items).map((i) => i.name),
    ["Hyaluron"],
  );
});

test("ohne pathKey bleibt die Seite stehen (aelterer Endpoint)", () => {
  assert.equal(cleanMenuTree([{ name: "Botox" }]).length, 1);
});

test("Eintraege ohne Namen fallen raus, auch bei den Kindern", () => {
  const items = [
    { name: "", pathKey: "x" },
    {
      name: "Botox",
      pathKey: "botox",
      children: [
        { name: " ", pathKey: "botox/a" },
        { name: "Lip Flip", pathKey: "botox/lip-flip" },
      ],
    },
  ];
  const out = cleanMenuTree(items);
  assert.equal(out.length, 1);
  assert.deepEqual(out[0].children?.map((c) => c.name), ["Lip Flip"]);
});
