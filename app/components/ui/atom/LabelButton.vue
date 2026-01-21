<template>
  <div class="tagButton">
    <span class="tagButton__label">
      {{ label }}
    </span>
    <slot />
  </div>
</template>
<script setup lang="ts">
const props = defineProps<{
  label: string;
}>();
</script>
<style scoped>
.tagButton {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.5);
  padding: var(--space-100);
  border-radius: 999px;
  color: var(--color-text);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.tagButton__label {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  font-weight: var(--font-bold);
  padding: 0 var(--space-300) 0 var(--space-400);
}
</style>
