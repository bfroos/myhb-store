<template>
  <section
    :class="{
      'section--sibling': spacing === 'sibling',
    }"
  >
    <slot />
  </section>
</template>
<script setup lang="ts">
const props = defineProps<{
  spacing?: "sibling";
}>();
</script>
<style scoped>
section {
  padding: 0 var(--container-pad);
  margin-top: var(--space-bento-gap);
}
section.section--sibling {
  margin-top: var(--space-bento-gap-sm);
}
</style>
