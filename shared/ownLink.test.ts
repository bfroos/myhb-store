import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeOwnLink } from "./ownLink.ts";

test("eigene absolute Links ohne Schraegstrich am Ende", () => {
  assert.equal(
    normalizeOwnLink("https://www.myhealthandbeauty.com/standorte/duisburg/forum/hyaluron/"),
    "https://www.myhealthandbeauty.com/standorte/duisburg/forum/hyaluron",
  );
  assert.equal(
    normalizeOwnLink("https://myhealthandbeauty.com/behandlungen/?utm_source=x#preise"),
    "https://myhealthandbeauty.com/behandlungen?utm_source=x#preise",
  );
});

test("relative Links ohne Schraegstrich am Ende", () => {
  assert.equal(normalizeOwnLink("/behandlungen/"), "/behandlungen");
  assert.equal(normalizeOwnLink("/blog/?x=1"), "/blog?x=1");
});

test("unveraendert: Startseite, fremde Links, ohne Schraegstrich", () => {
  for (const url of [
    "/",
    "https://www.myhealthandbeauty.com/",
    "https://www.instagram.com/myhealthandbeauty.app/",
    "https://www.myhealthandbeauty.com/standorte/koeln",
    "/standorte/koeln",
    "mailto:info@example.com",
    "tel:+49",
    "//cdn.example.com/a/",
    "",
  ]) {
    assert.equal(normalizeOwnLink(url), url, url);
  }
});
