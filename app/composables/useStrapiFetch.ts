import qs from "qs";

export function useStrapiFetch<T>(path: string, opts: any = {}) {
  if (!path.startsWith("/")) {
    throw new Error("useStrapiFetch path must start with '/'");
  }

  const { query, fetchOptions, ...restOpts } = opts;

  const qsString =
    query && Object.keys(query).length > 0
      ? qs.stringify(query, { encodeValuesOnly: true })
      : "";
  const queryString = qsString ? `?${qsString}` : "";

  const url = `/api/strapi${path}${queryString}`;

  const key = fetchOptions?.key ?? opts.key ?? `strapi:${path}:${qsString}`;

  return useFetch<T>(url, {
    ...restOpts,
    ...fetchOptions,
    key,
  });
}
