<template>
  <NuxtLayout>
    <NuxtPage :key="pageKey" />
  </NuxtLayout>
</template>

<script setup lang="ts">
const route = useRoute();
const { locale, fallbackLocale } = useI18n();
const currentLocale = computed(
  () => (locale.value || fallbackLocale.value) as string,
);

const pageKey = computed(() => `${locale.value}:${route.fullPath}`);

useHead(() => ({
  htmlAttrs: { lang: currentLocale.value },
}));
</script>
