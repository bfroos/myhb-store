import qs from "qs";
import { computed, isRef, isReactive } from "vue";
import type { Ref, ComputedRef } from "vue";

type QueryObject = Record<string, unknown>;
type QueryLike =
  | QueryObject
  | Ref<QueryObject>
  | ComputedRef<QueryObject>
  | null
  | undefined;

function resolveQuery(query: QueryLike): QueryObject {
  if (!query) return {};
  if (typeof query === "object" && "value" in query) {
    return (query.value ?? {}) as QueryObject;
  }
  return query as QueryObject;
}

function buildUrl(path: string, query: QueryObject): string {
  const qsString =
    query && Object.keys(query).length > 0
      ? qs.stringify(query, { encodeValuesOnly: true })
      : "";
  return qsString ? `/api/strapi${path}?${qsString}` : `/api/strapi${path}`;
}

export async function strapiFetch<T>(
  path: string,
  opts: { query?: QueryLike } = {},
): Promise<T> {
  if (!path.startsWith("/")) {
    throw new Error("strapiFetch path must start with '/'");
  }
  const url = buildUrl(path, resolveQuery(opts.query));
  return (await $fetch<T>(url)) as T;
}

export function useStrapiFetch<T>(path: string, opts: any = {}) {
  if (!path.startsWith("/")) {
    throw new Error("useStrapiFetch path must start with '/'");
  }

  const { query, fetchOptions, ...restOpts } = opts as {
    query?: QueryLike;
    fetchOptions?: Record<string, any>;
  };

  // Make the request URL reactive when `query` is a ref/computed.
  const url = computed(() => buildUrl(path, resolveQuery(query)));

  // Ensure different query variants do not share a cache entry.
  const key =
    fetchOptions?.key ??
    opts.key ??
    computed(() => {
      const resolvedQuery = resolveQuery(query);
      const qsString =
        resolvedQuery && Object.keys(resolvedQuery).length > 0
          ? qs.stringify(resolvedQuery, { encodeValuesOnly: true })
          : "";
      return qsString ? `strapi:${path}?${qsString}` : `strapi:${path}`;
    });

  const watchQuery =
    isRef(query) || isReactive(query) ? (query as any) : undefined;

  return useFetch<T>(url, {
    ...restOpts,
    ...(fetchOptions ?? {}),
    key,
    // Ensure refetch on reactive query changes (and keep any existing watchers)
    watch: [
      ...(((fetchOptions as any)?.watch as any[]) ?? []),
      watchQuery,
    ].filter(Boolean),
  });
}
