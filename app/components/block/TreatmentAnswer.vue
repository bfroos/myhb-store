<template>
  <!-- E24 #314: Kurzantwort (shared/treatmentAnswer.ts), KI-zitierfaehig -->
  <UiLayoutSectionBlock v-if="text" spacing="sibling">
    <section class="answer" data-track-placement="answer_box">
      <h2 class="answer__title">{{ headline }}</h2>
      <p class="answer__text" data-speakable>{{ text }}</p>
    </section>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
defineProps<{ headline: string; text: string | null }>();
</script>

<style scoped>
.answer {
  background: var(--color-card-bg-light, #fff);
  border-radius: var(--border-radius-card, 24px);
  padding: var(--space-card-pad);
}
.answer__title {
  margin: 0 0 var(--space-400);
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  line-height: 1.25;
}
.answer__text {
  margin: 0;
  max-width: 62rem;
  border-left: 3px solid var(--color-gray-900, #111);
  padding-left: var(--space-500);
  font-size: var(--font-lg);
  line-height: 1.55;
}
</style>
