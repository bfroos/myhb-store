<template>
  <section :id="anchor || undefined" class="karten">
    <div class="karten__kopf">
      <p v-if="eyebrow" class="karten__eyebrow">{{ eyebrow }}</p>
      <h2 v-if="headline" class="karten__titel">{{ headline }}</h2>
      <p v-if="text" class="karten__text">{{ text }}</p>
    </div>
    <div class="karten__raster">
      <article v-for="k in eintraege" :key="k.title" class="karten__karte">
        <h3 class="karten__karte-titel">{{ k.title }}</h3>
        <p v-if="k.text" class="karten__karte-text">{{ k.text }}</p>
        <p v-if="k.suitable" class="karten__karte-zusatz"><strong>{{ k.suitableLabel || "Geeignet für" }}:</strong> {{ k.suitable }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
/** Ueberschrift + 2-3 Karten, z. B. die Methoden in Michaels Entwurf (E28). */
type Karte = { title: string; text?: string; suitable?: string; suitableLabel?: string };
const props = defineProps<{
  eyebrow?: string | null;
  headline?: string | null;
  text?: string | null;
  anchor?: string | null;
  items?: Karte[] | null;
}>();
const eintraege = computed(() => (Array.isArray(props.items) ? props.items : []).filter((k) => k?.title));
</script>

<style scoped>
.karten { display: flex; flex-direction: column; gap: var(--space-700, 32px); scroll-margin-top: 96px; }
.karten__kopf { display: flex; flex-direction: column; gap: var(--space-300, 12px); max-width: 45rem; }
.karten__eyebrow { margin: 0; font-size: var(--font-sm); letter-spacing: 0.16em; text-transform: uppercase; color: var(--color-gray-700); }
.karten__titel { margin: 0; font-size: var(--font-4xl); line-height: var(--line-4xl); font-weight: var(--font-bold); }
.karten__text { margin: 0; color: var(--color-text-light); }
.karten__raster { display: grid; gap: var(--space-600, 24px); }
.karten__karte {
  background: var(--color-white); border-radius: var(--border-radius-card-figure);
  padding: var(--space-700, 28px); display: flex; flex-direction: column; gap: 14px;
}
.karten__karte p, .karten__karte h3 { margin: 0; }
.karten__karte-titel { font-size: var(--font-2xl); line-height: var(--line-2xl); font-weight: var(--font-bold); }
.karten__karte-text { color: var(--color-text-light); }
@media (min-width: 900px) {
  .karten__titel { font-size: var(--font-5xl); line-height: var(--line-5xl); }
  .karten__raster { grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); }
  .karten__karte { padding: var(--space-800, 32px); }
}
</style>
