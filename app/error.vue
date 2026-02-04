<template>
  <div class="error-page">
    <BaseAppHeader />
    <main class="error-page__content">
      <h1 class="error-page__title">
        {{ error?.statusCode }}
      </h1>
      <p class="error-page__message">
        {{ statusMessage }}
      </p>
      <p class="error-page__description">
        {{ description }}
      </p>
      <UiAtomBaseButton as="nuxt-link-locale" to="/" class="error-page__button">
        {{ buttonLabel }}
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

const statusCode = computed(() => props.error?.statusCode ?? 500);
const is404 = computed(() => statusCode.value === 404);

const statusMessage = computed(() =>
  is404.value ? t("error.404.statusMessage") : t("error.500.statusMessage"),
);
const description = computed(() =>
  is404.value ? t("error.404.message") : t("error.500.message"),
);
const buttonLabel = computed(() =>
  is404.value ? t("error.404.button") : t("error.500.button"),
);

useHead(
  computed(() => ({
    title: statusMessage.value,
    meta: [{ name: "robots", content: "noindex" }],
  })),
);
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
