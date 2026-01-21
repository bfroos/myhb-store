<template>
  <div class="app">
    <div>
      <NuxtPage />
      <CookieControl locale="en" />
    </div>
    <BaseAppFooter />
    <Toast />
    <DynamicDialog />
  </div>
</template>

<script setup lang="ts">
const { cookiesEnabledIds } = useCookieControl();
const { locale, fallbackLocale } = useI18n();
const currentLocale = (locale.value || fallbackLocale.value) as string;

// example: react to a cookie being accepted
watch(
  () => cookiesEnabledIds.value,
  (current, previous) => {
    if (
      !previous?.includes("google-analytics") &&
      current?.includes("google-analytics")
    ) {
      // cookie with id `google-analytics` got added
      window.location.reload(); // placeholder for custom change handler
    }
  },
  { deep: true },
);

useHead({
  htmlAttrs: {
    lang: currentLocale,
  },
});
</script>
<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.app > * {
  flex: 1;
}
.app > :last-child {
  flex: none;
}
</style>
