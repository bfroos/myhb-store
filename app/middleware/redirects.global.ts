export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return;

  const path = to.fullPath || to.path || "/";
  try {
    const response = await $fetch<{
      redirect: { target: string; code: number } | null;
    }>("/api/redirect-lookup", {
      query: { path },
    });

    if (response?.redirect?.target) {
      return navigateTo(response.redirect.target, { replace: true });
    }
  } catch {
    // Redirect lookup failure should not block navigation.
  }
});
