<template>
  <div class="empty-state">
    <main class="empty-state__content">
      <h1 v-if="title">{{ title }}</h1>
      <p v-if="description">
        {{ description }}
      </p>
      <div v-if="buttonLabel && buttonTo" class="empty-state__cta">
        <UiAtomBaseButton :as="buttonAs" :to="buttonTo">
          {{ buttonLabel }}
        </UiAtomBaseButton>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    buttonLabel?: string;
    buttonTo?: string;
    buttonAs?: "nuxt-link" | "nuxt-link-locale";
  }>(),
  {
    buttonAs: "nuxt-link-locale",
  },
);
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
}

.empty-state__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
  max-width: 90ch;
  margin: 0 auto;
  padding: var(--space-1200) var(--container-pad);
  text-align: center;
}

.empty-state__content > h1 {
  font-size: var(--font-4xl);
  line-height: var(--line-4xl);
  font-weight: var(--font-bold);
}

.empty-state__content > p {
  max-width: 48ch;
  font-size: 1rem;
  color: var(--color-text-secondary);
}
</style>
