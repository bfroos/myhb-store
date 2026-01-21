<template>
  <Select
    v-model="selectedLocaleCode"
    :options="availableLocales"
    option-label="name"
    option-value="code"
    size="small"
  >
    <template #dropdownicon>
      <IconWorld :size="18" />
    </template>
    <template #value="slotProps">
      <span>{{ getLocaleName(slotProps.value) }}</span>
    </template>
    <template #option="slotProps">
      {{ slotProps.option.name }}
    </template>
  </Select>
</template>

<script setup lang="ts">
import { IconWorld } from "@tabler/icons-vue";
import { computed } from "vue";
import Select from "primevue/select";

const { locale, locales, setLocale } = useI18n();
const switchLocalePath = useSwitchLocalePath();

const currentLocale = computed(() => {
  return (
    locales.value.find((l: any) => l.code === locale.value) ||
    locales.value[0] || { code: "de", name: "Deutsch", dir: "ltr" }
  );
});

const availableLocales = computed(() => {
  return locales.value.filter((l: any) => l.code !== locale.value);
});

const checkTreatmentPageExists = (targetLocale: string): boolean => {
  const currentTreatmentPage = useState<any>(
    "currentTreatmentPage",
    () => null
  );
  const treatmentPage = currentTreatmentPage.value;

  if (!treatmentPage || !treatmentPage.localizations) {
    return false;
  }

  // Prüfe, ob die Ziel-Locale in den Lokalisierungen enthalten ist
  const hasTargetLocale = treatmentPage.localizations.some(
    (l: any) => l.locale === targetLocale
  );

  return hasTargetLocale;
};

const selectedLocaleCode = computed({
  get: () => locale.value,
  set: async (newCode: string) => {
    if (newCode && newCode !== locale.value) {
      const isValidLocale = availableLocales.value.some(
        (l: any) => l.code === newCode
      );

      if (!isValidLocale) {
        return;
      }

      // Prüfe, ob die Zielseite existiert (nur für Service Pages)
      const currentTreatmentPage = useState<any>(
        "currentTreatmentPage",
        () => null
      );
      const isTreatmentPage = !!currentTreatmentPage.value;

      if (isTreatmentPage) {
        const pageExists = checkTreatmentPageExists(newCode);
        if (!pageExists) {
          // Wenn die Seite nicht existiert, navigiere zur Startseite der neuen Locale
          const homePath = newCode === "de" ? "/" : `/${newCode}`;
          await navigateTo(homePath);
          return;
        }
      }

      // Navigiere zur entsprechenden Route in der neuen Locale
      const targetPath = switchLocalePath(newCode as any);
      if (targetPath) {
        await navigateTo(targetPath);
      } else {
        // Fallback: Setze nur die Locale, wenn keine Route gefunden wurde
        setLocale(newCode as any);
      }
    }
  },
});

const getLocaleName = (code: string | null) => {
  if (!code) return currentLocale.value.name;
  const localeObj = locales.value.find((l: any) => l.code === code);
  return localeObj?.name || currentLocale.value.name;
};
</script>
