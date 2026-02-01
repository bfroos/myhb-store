<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { locale, fallbackLocale } = useI18n();
const currentLocale = (locale.value || fallbackLocale.value) as string;

useHead({
  htmlAttrs: {
    lang: currentLocale,
  },
});
</script>
