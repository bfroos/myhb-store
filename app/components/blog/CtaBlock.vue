<template>
  <div class="ctaBlock">
    <h2>{{ headline }}</h2>
    <SharedButton :button="button" />
  </div>
</template>
<script setup lang="ts">
import type { SharedButtonDto } from "~/lib/strapi/dto/components";

const props = defineProps<{
  button: SharedButtonDto;
  headline: string;
}>();
</script>
<style scoped>
.ctaBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
  background-color: var(--color-gray-200);
  padding: var(--space-card-pad-sm);
  border-radius: var(--border-radius-200);
  margin: 2em 0;
}
.ctaBlock h2 {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
}

@media screen and (min-width: 1100px) {
  .ctaBlock {
    margin: 2em calc(var(--space-card-pad) * -1);
  }
}
</style>
