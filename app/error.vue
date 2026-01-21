<template>
  <div class="error-page">
    <BaseAppHeader />
    <main class="error-page__content">
      <h1 class="error-page__title">
        {{ error?.statusCode }}
      </h1>
      <p v-if="error?.statusMessage" class="error-page__message">
        {{ error?.statusMessage }}
      </p>
      <p v-if="error?.message" class="error-page__description">
        {{ error?.message }}
      </p>
      <UiAtomBaseButton as="nuxt-link-locale" to="/" class="error-page__button">
        {{ t("error.404.button") }}
      </UiAtomBaseButton>
    </main>
    <BaseAppFooter />
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

const props = defineProps({
  error: Object as () => NuxtError,
});

const { t } = useI18n();

useHead({
  title: props.error?.statusMessage,
  meta: [{ name: "robots", content: "noindex" }],
});
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.error-page__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-800) var(--container-pad);
  text-align: center;
}

.error-page__title {
  font-size: 6rem;
  font-weight: 700;
  margin-bottom: var(--space-400);
  color: var(--color-text-primary);
}

.error-page__message {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: var(--space-200);
  color: var(--color-text-primary);
}

.error-page__description {
  font-size: 1rem;
  margin-bottom: var(--space-600);
  color: var(--color-text-secondary);
}

.error-page__button {
  margin-top: var(--space-400);
}
</style>
