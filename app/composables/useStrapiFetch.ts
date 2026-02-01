import qs from "qs";
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

  // Keep key behavior simple. A constant key is OK because `url` changes will refetch.
  const key = fetchOptions?.key ?? opts.key ?? `strapi:${path}`;

  return useFetch<T>(url, {
    ...restOpts,
    ...(fetchOptions ?? {}),
    key,
    // Ensure refetch on reactive query changes (and keep any existing watchers)
    watch: [
      ...(((fetchOptions as any)?.watch as any[]) ?? []),
      query as any,
    ].filter(Boolean),
  });
}
