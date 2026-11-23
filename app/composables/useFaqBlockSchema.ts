import { shallowReactive, getCurrentScope, onScopeDispose, type Ref, type ComputedRef } from "vue";
import { buildFaqPageSchema } from "~/utils/schemaFaq";
import type { FaqDto } from "~/lib/strapi/dto/collections";

type SchemaSource =
  | Ref<Record<string, unknown> | null>
  | ComputedRef<Record<string, unknown> | null>;

type FaqSchemaRegistry = {
  /** Alle per useSchemaOrg angemeldeten Schemas der Seite (um ein eigenes FAQPage zu erkennen). */
  pageSchemas: Set<SchemaSource>;
  /** FAQ-Listen aller gerenderten blocks.faq der Seite. */
  blocks: Set<() => FaqDto[]>;
};

/**
 * Seitenweites Register. Auf dem Server je Anfrage (nuxtApp), im Browser je
 * App-Instanz; Einträge räumen sich beim Unmount selbst ab.
 */
function useFaqSchemaRegistry(): FaqSchemaRegistry {
  const nuxtApp = useNuxtApp() as unknown as { _faqSchemaRegistry?: FaqSchemaRegistry };
  if (!nuxtApp._faqSchemaRegistry) {
    nuxtApp._faqSchemaRegistry = {
      pageSchemas: shallowReactive(new Set()),
      blocks: shallowReactive(new Set()),
    };
  }
  return nuxtApp._faqSchemaRegistry;
}

function addUntilDispose<T>(set: Set<T>, item: T): void {
  set.add(item);
  if (getCurrentScope()) onScopeDispose(() => set.delete(item));
}

/** Von useSchemaOrg aufgerufen: merkt sich jedes Seiten-Schema. */
export function registerPageSchema(schema: SchemaSource): void {
  addUntilDispose(useFaqSchemaRegistry().pageSchemas, schema);
}

/**
 * Schema.org FAQPage für Strapi-Blöcke `blocks.faq`.
 *
 * - Nur aktive Fragen (isActive !== false).
 * - Genau ein FAQPage je Seite: mehrere FAQ-Blöcke werden zusammengeführt
 *   (gleicher head-Key), doppelte Fragen fallen raus.
 * - Gibt eine Seite schon selbst ein FAQPage aus (Startseite, Behandlungen,
 *   Blog, Kostenseiten …), schweigt der Block — Google erlaubt nur eins.
 */
export function useFaqBlockSchema(faqs: () => FaqDto[]): void {
  const registry = useFaqSchemaRegistry();
  addUntilDispose(registry.blocks, faqs);

  useHead(() => {
    const pageHasFaqPage = [...registry.pageSchemas].some(
      (s) => s.value?.["@type"] === "FAQPage",
    );
    if (pageHasFaqPage) return {};

    const seen = new Set<string>();
    const items: FaqDto[] = [];
    for (const getFaqs of registry.blocks) {
      for (const faq of getFaqs() ?? []) {
        if (!faq || faq.isActive === false) continue;
        const key = String(faq.question ?? "").trim().toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);
        items.push(faq);
      }
    }

    const schema = buildFaqPageSchema(items);
    if (!schema) return {};
    return {
      script: [
        {
          key: "schema-faqpage-blocks",
          type: "application/ld+json",
          innerHTML: JSON.stringify(schema),
        },
      ],
    };
  });
}
