<template>
  <section v-if="eintraege.length" class="stats">
    <div v-for="e in eintraege" :key="e.label" class="stats__item">
      <p class="stats__wert">{{ e.value }}</p>
      <p class="stats__label">{{ e.label }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
/** Zahlenleiste unter dem Hero (E28, Michaels Entwurf). */
const props = defineProps<{ items?: { value?: string; label?: string }[] | null }>();
const eintraege = computed(() =>
  (Array.isArray(props.items) ? props.items : []).filter((i) => i?.value && i?.label) as {
    value: string;
    label: string;
  }[],
);
</script>

<style scoped>
.stats {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-600, 24px);
  background: var(--color-white); border-radius: var(--border-radius-card-figure);
  padding: var(--space-700, 28px) var(--space-600, 24px); text-align: center;
}
.stats__item p { margin: 0; }
.stats__wert { font-size: var(--font-2xl); line-height: var(--line-2xl); font-weight: var(--font-bold); }
.stats__label { font-size: var(--font-sm); color: var(--color-text-light); }
@media (min-width: 900px) {
  .stats { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); }
}
</style>
