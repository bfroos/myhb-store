<template>
  <div class="app">
    <div>
      <BaseAppHeader />
      <slot />
      <CookieControl :locale="currentLocale" />
    </div>
    <BaseAppFooter />
    <Toast />
    <DynamicDialog />
  </div>
</template>
<script setup lang="ts">
const { locale, fallbackLocale } = useI18n();
const currentLocale = locale.value || fallbackLocale.value || "de";
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
