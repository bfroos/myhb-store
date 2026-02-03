import type { Ref, ComputedRef } from "vue";

/**
 * Injects Schema.org JSON-LD into the document head.
 * Accepts a ref or computed that returns the schema object or null.
 */
export function useSchemaOrg(
  schema:
    | Ref<Record<string, unknown> | null>
    | ComputedRef<Record<string, unknown> | null>,
): void {
  useHead(() => ({
    script: schema.value
      ? [
          {
            type: "application/ld+json",
            innerHTML: JSON.stringify(schema.value),
          },
        ]
      : [],
  }));
}
