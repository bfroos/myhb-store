<template>
  <Select
    v-model="selectedLocaleCode"
    :options="availableLocales"
    option-label="name"
    option-value="code"
    size="small"
    append-to="self"
    overlay-class="languageSwitcher__overlay--alignRight"
    :aria-label="$t('navigation.header.languageSwitcher')"
    :pt="{
      root: 'languageSwitcher',
      label: 'languageSwitcher__label',
      dropdown: 'languageSwitcher__dropdown',
    }"
  >
    <template #dropdownicon>
      <IconWorld :size="18" />
    </template>
    <template #value="slotProps">
      <span>{{ getLocaleCode(slotProps.value) }}</span>
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

const currentLocale = computed(() => {
  return (
    locales.value.find((l: any) => l.code === locale.value) ||
    locales.value[0] || { code: "de", name: "Deutsch", dir: "ltr" }
  );
});

const availableLocales = computed(() => {
  return locales.value.filter((l: any) => l.code !== locale.value);
});

const selectedLocaleCode = computed({
  get: () => locale.value,
  set: async (newCode: string) => {
    if (newCode && newCode !== locale.value) {
      const isValidLocale = availableLocales.value.some(
        (l: any) => l.code === newCode,
      );

      if (!isValidLocale) {
        return;
      }

      await setLocale(newCode as any);
    }
  },
});

const getLocaleCode = (code: string | null) => {
  if (!code) return currentLocale.value.code?.toUpperCase() ?? "";
  return code.toUpperCase();
};
</script>
<style scoped>
.languageSwitcher {
  position: relative;
  display: inline-flex;
  flex-direction: row-reverse;
  gap: var(--space-200);
  padding: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  height: 40px;
}

.languageSwitcher :deep(.languageSwitcher__label),
.languageSwitcher :deep(.languageSwitcher__dropdown) {
  padding: 0;
  width: auto;
  display: inline-flex;
  align-items: center;
}

.languageSwitcher :deep(.languageSwitcher__dropdown) svg {
  width: 20px;
  height: 20px;
  color: var(--color-text);
  stroke-width: 1.5;
}

.languageSwitcher :deep(.languageSwitcher__overlay--alignRight) {
  left: auto !important;
  right: 0 !important;
}
</style>
