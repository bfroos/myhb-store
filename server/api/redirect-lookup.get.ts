import { resolveRedirect, splitPathAndSearch } from "../utils/redirects";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawPath = typeof query.path === "string" ? query.path : "";
  if (!rawPath) {
    return { redirect: null };
  }

  const { pathname, search } = splitPathAndSearch(rawPath);
  const result = await resolveRedirect(pathname, search);
  return { redirect: result };
});
