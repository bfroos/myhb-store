<template>
  <details>
    <summary>
      <slot name="icon" />
      {{ headline }}
      <IconCirclePlus :size="32" stroke="1" class="summaryDetail__plus" />
      <IconCircleMinus :size="32" stroke="1" class="summaryDetail__minus" />
    </summary>
    <article>
      <slot />
    </article>
  </details>
</template>

<script setup lang="ts">
import { IconCirclePlus, IconCircleMinus } from "@tabler/icons-vue";

defineProps<{
  headline: string;
}>();
</script>

<style scoped>
article {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  padding: 0 0 var(--space-400) calc(var(--space-400) + 24px);
}
summary {
  display: flex;
  align-items: center;
  gap: var(--space-400);
  padding: var(--space-400) 0;
  cursor: pointer;
}
summary:hover :is(.summaryDetail__plus, .summaryDetail__minus) {
  color: var(--color-text);
}
.summaryDetail__plus,
.summaryDetail__minus {
  margin-left: auto;
  color: var(--color-text-light);
}
.summaryDetail__plus {
  display: block;
}
.summaryDetail__minus {
  display: none;
}
details[open] .summaryDetail__plus {
  display: none;
}
details[open] .summaryDetail__minus {
  display: block;
}
details + details {
  border-top: 1px solid var(--color-border-light);
}
</style>
