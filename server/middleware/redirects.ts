import { resolveRedirect } from "../utils/redirects";

export default defineEventHandler(async (event) => {
  const method = event.method || "GET";
  if (method !== "GET" && method !== "HEAD") return;

  const config = useRuntimeConfig();
  if (config.public.siteMode === "ads") return;

  const { pathname, search } = getRequestURL(event);
  const result = await resolveRedirect(pathname, search);
  if (!result) return;
  return sendRedirect(event, result.target, result.code);
});
