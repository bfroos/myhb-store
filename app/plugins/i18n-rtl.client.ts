import { watch } from "vue";

export default defineNuxtPlugin((nuxtApp) => {
  // In plugins, use $i18n from nuxtApp instead of useI18n()
  const i18n = nuxtApp.$i18n;
  const locale = i18n.locale;
  const locales = i18n.locales;

  // Set dir attribute on html element based on current locale
  const updateDir = () => {
    if (process.client) {
      const currentLocale = locales.value.find((l: any) => l.code === locale.value);
      const dir = currentLocale?.dir || "ltr";
      document.documentElement.setAttribute("dir", dir);
      document.documentElement.setAttribute("lang", locale.value);
    }
  };

  // Update on initial load
  if (process.client) {
    updateDir();
  }

  // Watch for locale changes
  watch(locale, () => {
    updateDir();
  });
});

