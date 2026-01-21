<template>
  <section
    :class="{
      'section--sibling': spacing === 'sibling',
      'section--section': spacing === 'section',
    }"
  >
    <slot />
  </section>
</template>
<script setup lang="ts">
const props = defineProps<{
  spacing?: "first" | "sibling" | "section";
}>();
</script>
<style scoped>
section {
  padding: 0 var(--container-pad);
  margin-top: var(--space-400);
}
section.section--sibling {
  margin-top: var(--space-600);
}
section.section--section {
  margin-top: var(--space-8000);
}
</style>
