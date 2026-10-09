import { test } from "node:test";
import assert from "node:assert/strict";
import {
  blogCategoryLocaleSlugs,
  blogCategoryPath,
  selectAlternateLocales,
} from "./hreflang.ts";

const LOCALES = ["de", "en", "tr", "ar", "fr", "nl"];

// Strapi blog-categories, Stand 08.10.2026 (locale=*), je documentId.
// Spalten in der Reihenfolge von LOCALES.
const CATEGORIES: Record<string, string[]> = {
  infusionen: ["infusionen", "infusions", "infusionen", "infusionen", "infusionen", "infusionen"],
  botox: ["botox", "botox", "botox", "botox", "botox", "botox"],
  haare: ["haare", "hair", "haare", "haare", "cheveux", "haar"],
  op: ["schoenheitsoperationen", "plastic-surgery", "schoenheitsoperationen", "schoenheitsoperationen", "chirurgie-esthetique", "schoonheidsoperaties"],
  fettweg: ["fettwegspritze", "fat-removal-injection", "fettwegspritze", "fettwegspritze", "injection-lipolytique", "vetinjectie"],
  my: ["my", "my", "my", "my", "my", "my"],
  hyaluron: ["hyaluron", "hyaluronic-acid", "hyaluron", "hyaluron", "acide-hyaluronique", "hyaluron"],
  skinbooster: ["skinbooster", "blog-category", "blog-category", "blog-category", "blog-category", "blog-category"],
};

/** Alle existierenden Kategorie-URLs (Seite 1) aller Sprachen. */
const EXISTING = new Set(
  Object.values(CATEGORIES).flatMap((slugs) =>
    slugs.map((slug, i) => blogCategoryPath(LOCALES[i]!, slug)),
  ),
);

/** Lokalisierungen einer Kategorie aus Sicht einer Sprache (ohne sich selbst). */
function localizationsFor(doc: string, locale: string) {
  return LOCALES.map((code, i) => ({ locale: code, slug: CATEGORIES[doc]![i] }))
    .filter((entry) => entry.locale !== locale);
}

/** hreflang-Ziele einer Kategorieseite wie setPageSeo sie baut. */
function alternatesNew(doc: string, locale: string): Map<string, string> {
  const slug = CATEGORIES[doc]![LOCALES.indexOf(locale)]!;
  const slugs = blogCategoryLocaleSlugs(locale, slug, localizationsFor(doc, locale));
  assert.ok(slugs);
  const covered = Object.keys(slugs);
  const result = new Map<string, string>();
  for (const code of selectAlternateLocales(LOCALES, locale, covered)) {
    result.set(code, blogCategoryPath(code, slugs[code]!));
  }
  return result;
}

/** Verhalten vor dem Fix: keine Abdeckung -> alle Sprachen, eigener Slug. */
function alternatesOld(doc: string, locale: string): Map<string, string> {
  const slug = CATEGORIES[doc]![LOCALES.indexOf(locale)]!;
  const result = new Map<string, string>();
  for (const code of selectAlternateLocales(LOCALES, locale, null)) {
    result.set(code, blogCategoryPath(code, slug));
  }
  return result;
}

test("selectAlternateLocales: Verhalten wie bisher in seo.ts", () => {
  assert.deepEqual(selectAlternateLocales(LOCALES, "de", null), LOCALES);
  assert.deepEqual(selectAlternateLocales(LOCALES, "en", ["de"]), ["de", "en"]);
  assert.deepEqual(selectAlternateLocales(LOCALES, "fr", ["fr"]), ["fr"]);
  assert.deepEqual(selectAlternateLocales(LOCALES, "de", []), ["de"]);
});

test("blogCategoryLocaleSlugs: Strapi-Lokalisierungen plus eigene Sprache", () => {
  assert.deepEqual(
    blogCategoryLocaleSlugs("de", "haare", [
      { locale: "en", slug: "hair" },
      { locale: "fr", slug: "cheveux" },
      { locale: "nl", slug: "" },
      { locale: "tr", slug: null },
    ]),
    { en: "hair", fr: "cheveux", de: "haare" },
  );
  assert.equal(blogCategoryLocaleSlugs("de", "haare", undefined), null);
  assert.deepEqual(blogCategoryLocaleSlugs("en", "hair", []), { en: "hair" });
});

test("blogCategoryPath: Pfade wie Nuxt i18n (prefix_except_default, ar = mudawwana)", () => {
  assert.equal(blogCategoryPath("de", "haare"), "/blog/c/haare");
  assert.equal(blogCategoryPath("en", "hair"), "/en/blog/c/hair");
  assert.equal(blogCategoryPath("ar", "haare"), "/ar/mudawwana/c/haare");
});

test("Vorher: Audit-Fehlerbild reproduziert (78 eindeutige 404-Ziele)", () => {
  const broken = new Set<string>();
  for (const doc of Object.keys(CATEGORIES)) {
    for (const locale of LOCALES) {
      for (const href of alternatesOld(doc, locale).values()) {
        if (!EXISTING.has(href)) broken.add(href);
      }
    }
  }
  assert.equal(broken.size, 78);
  assert.ok(broken.has("/en/blog/c/haare"));
  assert.ok(broken.has("/blog/c/hair"));
});

test("Nachher: kein hreflang-Ziel einer Kategorieseite ist 404", () => {
  for (const doc of Object.keys(CATEGORIES)) {
    for (const locale of LOCALES) {
      for (const [code, href] of alternatesNew(doc, locale)) {
        assert.ok(EXISTING.has(href), `${locale} ${doc} -> ${code}: ${href}`);
      }
    }
  }
});

test("Nachher: alle Kategorieseiten verweisen gegenseitig aufeinander (Reciprocity)", () => {
  for (const doc of Object.keys(CATEGORIES)) {
    for (const locale of LOCALES) {
      const self = alternatesNew(doc, locale).get(locale)!;
      for (const [code, href] of alternatesNew(doc, locale)) {
        const back = alternatesNew(doc, code).get(locale);
        assert.equal(back, self, `${href} verweist nicht zurueck auf ${self}`);
      }
      // Jede Sprache der Kategorie ist verknuepft (6 Alternates).
      assert.equal(alternatesNew(doc, locale).size, LOCALES.length);
    }
  }
});
