<template>
  <section class="vergleich">
    <div class="vergleich__kopf">
      <h2 v-if="headline" class="vergleich__titel">{{ headline }}</h2>
      <p v-if="text" class="vergleich__text">{{ text }}</p>
    </div>

    <div class="vergleich__raster">
      <div v-if="bilder.length" class="vergleich__mosaik" :class="`vergleich__mosaik--${Math.min(bilder.length, 4)}`">
        <UiAtomMediaPicture
          v-for="(bild, i) in bilder.slice(0, 4)"
          :key="bild.url ?? i"
          :media="bild"
          class="vergleich__bild"
          :class="`vergleich__bild--${i + 1}`"
          loading="lazy"
        />
      </div>

      <div class="vergleich__tabelle-wrap">
        <table class="vergleich__tabelle">
          <thead>
            <tr>
              <th scope="col" class="vergleich__th-label">{{ rowsLabel || "Leistungen" }}</th>
              <th scope="col" class="vergleich__th-wir">
                <span class="vergleich__wir-gross">MY</span>
                <span class="vergleich__wir-klein">HEALTH &amp;<br />BEAUTY</span>
              </th>
              <th v-if="otherLabel" scope="col" class="vergleich__th-andere">{{ otherLabel }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in zeilen" :key="r.label" :class="{ 'vergleich__letzte': i === zeilen.length - 1 }">
              <th scope="row" class="vergleich__zeile">{{ r.label }}</th>
              <td class="vergleich__wir">
                <span role="img" aria-label="Ja" class="vergleich__ja vergleich__ja--wir"><IconCheck size="18" aria-hidden="true" /></span>
              </td>
              <td v-if="otherLabel" class="vergleich__andere">
                <span v-if="r.other" role="img" aria-label="Ja" class="vergleich__ja"><IconCheck size="16" aria-hidden="true" /></span>
                <span v-else role="img" aria-label="Nein" class="vergleich__nein"><IconX size="20" aria-hidden="true" /></span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <UiAtomBaseButton
      v-if="ctaLabel"
      as="a"
      :href="`#${(ctaAnchor || 'anfrage').replace(/^#/, '')}`"
      size="lg"
      variant="primary"
      class="vergleich__cta"
    >
      {{ ctaLabel }}
    </UiAtomBaseButton>
  </section>
</template>

<script setup lang="ts">
import { IconCheck, IconX } from "@tabler/icons-vue";
import type { StrapiMedia } from "~/lib/strapi/dto/types";

/**
 * "Rundum-Sorglos-Paket" aus Michaels Entwurf (E28): Bild-Mosaik links,
 * Vergleichstabelle wir/andere rechts, Knopf zum Funnel.
 * rows: [{ label, other }] - other=true heisst, die anderen bieten das auch.
 */
const props = defineProps<{
  headline?: string | null;
  text?: string | null;
  images?: StrapiMedia[] | null;
  rowsLabel?: string | null;
  oursLabel?: string | null;
  otherLabel?: string | null;
  rows?: { label?: string; other?: boolean }[] | null;
  ctaLabel?: string | null;
  ctaAnchor?: string | null;
}>();

const bilder = computed(() => (Array.isArray(props.images) ? props.images : []));
const zeilen = computed(() =>
  (Array.isArray(props.rows) ? props.rows : []).filter((r) => r?.label) as { label: string; other?: boolean }[],
);
</script>

<style scoped>
.vergleich {
  display: flex; flex-direction: column; gap: var(--space-700, 32px);
  background: var(--color-white); border-radius: var(--border-radius-card);
  padding: var(--space-card-pad-xs);
}
.vergleich__kopf { max-width: 46rem; margin: 0 auto; text-align: center; display: flex; flex-direction: column; gap: var(--space-300, 12px); }
.vergleich__titel { margin: 0; font-size: var(--font-4xl); line-height: var(--line-4xl); font-weight: var(--font-bold); }
.vergleich__text { margin: 0; color: var(--color-text-light); font-size: var(--font-lg); line-height: var(--line-lg); }
.vergleich__raster { display: grid; gap: var(--space-700, 32px); align-items: center; }
.vergleich__mosaik { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); grid-auto-rows: 120px; gap: 10px; }
.vergleich__bild { border-radius: var(--border-radius-700); overflow: hidden; }
.vergleich__bild :deep(img), .vergleich__bild :deep(picture) { width: 100%; height: 100%; object-fit: cover; display: block; }
.vergleich__bild--1 { grid-column: span 2; grid-row: span 2; }
.vergleich__bild--2 { grid-column: span 4; grid-row: span 2; }
.vergleich__bild--3 { grid-column: span 2; }
.vergleich__bild--4 { grid-column: span 4; }
/* drei Bilder: links hoch, rechts zwei uebereinander */
.vergleich__mosaik--3 .vergleich__bild--1 { grid-column: span 2; grid-row: span 3; }
.vergleich__mosaik--3 .vergleich__bild--2 { grid-column: span 4; grid-row: span 2; }
.vergleich__mosaik--3 .vergleich__bild--3 { grid-column: span 4; grid-row: span 1; }
.vergleich__mosaik--1 .vergleich__bild--1, .vergleich__mosaik--2 .vergleich__bild { grid-column: span 6; }
.vergleich__tabelle-wrap { overflow-x: auto; }
.vergleich__tabelle { width: 100%; border-collapse: separate; border-spacing: 0; font-size: var(--font-md); }
.vergleich__th-label { text-align: left; vertical-align: bottom; padding: 0 0 14px 16px; font-size: var(--font-sm); font-weight: var(--font-bold); }
.vergleich__th-wir {
  width: 112px; background: var(--color-gray-950); color: var(--color-white);
  border-radius: 24px 24px 0 0; padding: 22px 8px 16px; line-height: 1.25;
}
.vergleich__wir-gross { display: block; font-size: 1.75rem; font-weight: var(--font-bold); letter-spacing: 0.04em; }
.vergleich__wir-klein { display: block; font-size: 0.6875rem; letter-spacing: 0.16em; font-weight: var(--font-bold); }
.vergleich__th-andere { width: 104px; vertical-align: bottom; padding: 0 8px 14px; font-size: var(--font-sm); font-weight: var(--font-bold); }
.vergleich__zeile { text-align: left; font-weight: var(--font-regular); background: var(--color-gray-100); padding: 16px; border-top: 2px solid var(--color-white); }
.vergleich__wir { background: var(--color-gray-950); text-align: center; border-top: 2px solid var(--color-gray-800); padding: 10px 8px; }
.vergleich__andere { background: var(--color-gray-200); text-align: center; border-top: 2px solid var(--color-white); padding: 10px 8px; }
.vergleich__letzte .vergleich__zeile { border-radius: 0 0 0 14px; }
.vergleich__letzte .vergleich__wir { border-radius: 0 0 24px 24px; padding-bottom: 24px; }
.vergleich__letzte .vergleich__andere { border-radius: 0 0 14px 0; }
tbody tr:first-child .vergleich__zeile { border-radius: 14px 0 0 0; }
tbody tr:first-child .vergleich__andere { border-radius: 0 14px 0 0; }
.vergleich__ja {
  display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 999px;
  background: var(--color-gray-700); color: var(--color-white);
}
.vergleich__ja--wir { width: 32px; height: 32px; background: var(--color-white); color: var(--color-black); }
.vergleich__nein { display: inline-flex; color: var(--color-gray-500); }
.vergleich__cta { align-self: center; }
@media (min-width: 1024px) {
  .vergleich { padding: var(--space-900, 56px); gap: var(--space-800, 40px); }
  .vergleich__titel { font-size: var(--font-5xl); line-height: var(--line-5xl); }
  .vergleich__raster { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: var(--space-800, 40px); }
  .vergleich__mosaik { grid-auto-rows: 180px; }
}
</style>
