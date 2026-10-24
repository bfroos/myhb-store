<template>
  <section :id="anchor || undefined" class="ablauf theme-strong">
    <h2 v-if="headline" class="ablauf__titel">{{ headline }}</h2>
    <ol v-if="schritte.length" class="ablauf__schritte" role="list">
      <li v-for="(s, i) in schritte" :key="s.title" class="ablauf__schritt">
        <span class="ablauf__nummer">{{ String(i + 1).padStart(2, "0") }}</span>
        <p class="ablauf__schritt-titel">{{ s.title }}</p>
        <p v-if="s.text" class="ablauf__schritt-text">{{ s.text }}</p>
      </li>
    </ol>
    <div v-if="zeitleiste.length" class="ablauf__zeit">
      <p v-if="timelineTitle" class="ablauf__zeit-titel">{{ timelineTitle }}</p>
      <div class="ablauf__zeit-raster">
        <div v-for="t in zeitleiste" :key="t.when" class="ablauf__zeit-eintrag">
          <span class="ablauf__wann">{{ t.when }}</span>
          <span class="ablauf__zeit-text">{{ t.text }}</span>
        </div>
      </div>
      <p v-if="note" class="ablauf__hinweis">{{ note }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
/** Dunkler Ablauf-Block mit Schritten und Zeitleiste (E28, Michaels Entwurf). */
const props = defineProps<{
  headline?: string | null;
  anchor?: string | null;
  steps?: { title?: string; text?: string }[] | null;
  timelineTitle?: string | null;
  timeline?: { when?: string; text?: string }[] | null;
  note?: string | null;
}>();
const schritte = computed(() => (Array.isArray(props.steps) ? props.steps : []).filter((s) => s?.title) as { title: string; text?: string }[]);
const zeitleiste = computed(() => (Array.isArray(props.timeline) ? props.timeline : []).filter((t) => t?.when) as { when: string; text?: string }[]);
</script>

<style scoped>
.ablauf {
  background: var(--card-color-bg); color: var(--card-color-text, #fff);
  border-radius: var(--border-radius-card); padding: var(--space-card-pad-xs);
  display: flex; flex-direction: column; gap: var(--space-800, 40px); scroll-margin-top: 96px;
}
.ablauf p, .ablauf h2 { margin: 0; }
.ablauf__titel { font-size: var(--font-4xl); line-height: var(--line-4xl); font-weight: var(--font-bold); }
.ablauf__schritte { margin: 0; padding: 0; list-style: none; display: grid; gap: var(--space-700, 28px); }
.ablauf__schritt { display: flex; flex-direction: column; gap: 10px; border-top: 1px solid var(--color-gray-800); padding-top: 20px; }
.ablauf__nummer { font-size: 2.5rem; line-height: 1; color: var(--color-gray-400); font-weight: var(--font-bold); }
.ablauf__schritt-titel { font-weight: var(--font-bold); font-size: var(--font-lg); }
.ablauf__schritt-text { color: var(--color-gray-300); font-size: var(--font-sm); }
.ablauf__zeit { background: var(--color-gray-900); border-radius: var(--border-radius-card-figure); padding: var(--space-700, 28px); display: flex; flex-direction: column; gap: 20px; }
.ablauf__zeit-titel { font-weight: var(--font-bold); font-size: var(--font-lg); }
.ablauf__zeit-raster { display: grid; gap: var(--space-600, 24px); }
.ablauf__zeit-eintrag { display: flex; flex-direction: column; gap: 6px; }
.ablauf__wann { font-size: var(--font-xl); color: var(--color-white); font-weight: var(--font-bold); }
.ablauf__zeit-text { color: var(--color-gray-300); font-size: var(--font-sm); }
.ablauf__hinweis { font-size: var(--font-xs); color: var(--color-gray-400); }
@media (min-width: 900px) {
  .ablauf { padding: var(--space-900, 56px); }
  .ablauf__titel { font-size: var(--font-5xl); line-height: var(--line-5xl); }
  .ablauf__schritte { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .ablauf__zeit-raster { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
</style>
