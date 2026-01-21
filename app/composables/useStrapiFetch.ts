import qs from "qs";

type StrapiFetchOptions<T> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, any>;
  fetchOptions?: Parameters<typeof useFetch<T>>[1];
};

export function useStrapiFetch<T>(
  path: string,
  opts: StrapiFetchOptions<T> = {}
) {
  const config = useRuntimeConfig();

  const queryString = opts.query
    ? qs.stringify(opts.query, { encodeValuesOnly: true })
    : "";

  const url =
    `${config.public.strapiUrl}` +
    (path.startsWith("/") ? path : `/${path}`) +
    (queryString ? `?${queryString}` : "");

  return useFetch<T>(url, {
    method: opts.method ?? ("get" as any),
    ...opts.fetchOptions,
  });
}
