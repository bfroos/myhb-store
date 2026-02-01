/**
 * Load globals once on app initialization
 * This plugin runs on both server and client side and loads the globals data
 * which can then be accessed via useGlobals() anywhere in the app
 */

export default defineNuxtPlugin(async (nuxtApp) => {
  // In plugins, use $i18n from nuxtApp for better compatibility
  const i18n = nuxtApp.$i18n as any;
  const activeLocale = (i18n.locale.value ||
    i18n.fallbackLocale.value) as string;

  const { data } = await useStrapiFetch<any>("/global", {
    query: {
      locale: activeLocale,
      populate: {
        marketing: {
          populate: "*",
        },
        brand: {
          populate: "*",
        },
        seo: {
          populate: "*",
        },
        ecommerce: {
          populate: "*",
        },
      },
    },
    fetchOptions: {
      key: `globals:${activeLocale}`,
    },
  });

  const strapiData = data.value?.data;

  useState("globals", () => strapiData);
});
