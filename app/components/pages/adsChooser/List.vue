<template>
  <!--
    go.* Auswahlseiten (shared/adsChooser.ts): ersetzen die alten
    Uebersichtsseiten. Eine Karte im Look der Vorlage v2, darin Gruppen mit
    Zeilen; jede Zeile fuehrt eine Stufe tiefer oder auf die v2-Seite.
  -->
  <UiLayoutSectionBlock>
    <div class="ch-card" :data-track-placement="placement">
      <p v-if="eyebrow" class="ch-eyebrow">{{ eyebrow }}</p>
      <h1 class="ch-h1">{{ title }}</h1>
      <p v-if="lead" class="ch-lead">{{ lead }}</p>

      <section v-for="group in groups" :key="group.label ?? 'all'" class="ch-group">
        <h2 v-if="group.label" class="ch-h2">{{ group.label }}</h2>
        <ul class="ch-list" role="list">
          <li v-for="item in group.items" :key="item.href">
            <NuxtLink :to="item.href" class="ch-row">
              <span class="ch-row__text">
                <strong>{{ item.title }}</strong>
                <span v-if="item.sub" class="ch-row__sub">{{ item.sub }}</span>
              </span>
              <IconChevronRight class="ch-row__icon" size="20" aria-hidden="true" />
            </NuxtLink>
          </li>
        </ul>
      </section>

      <NuxtLink v-if="back" :to="back.href" class="ch-back">
        <IconChevronLeft size="18" aria-hidden="true" />
        {{ back.label }}
      </NuxtLink>
    </div>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-vue";

export type AdsChooserItem = { href: string; title: string; sub?: string };
export type AdsChooserGroup = { label?: string; items: AdsChooserItem[] };

defineProps<{
  title: string;
  eyebrow?: string;
  lead?: string;
  groups: AdsChooserGroup[];
  back?: { href: string; label: string } | null;
  placement: string;
}>();
</script>

<style scoped>
.ch-card {
  max-width: 720px;
  margin-inline: auto;
  padding: var(--space-card-pad);
  border-radius: var(--border-radius-card);
  background: var(--color-card-bg-light, #fff);
}

.ch-eyebrow {
  margin: 0 0 var(--space-300);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-light);
}

.ch-h1 {
  margin: 0 0 var(--space-300);
  font-size: clamp(1.75rem, 7vw, 2.5rem);
  line-height: 1.08;
  font-weight: 500;
  letter-spacing: -0.025em;
  text-wrap: balance;
  hyphens: manual;
}

.ch-lead {
  margin: 0 0 var(--space-500);
  color: var(--color-text-light);
}

.ch-group + .ch-group {
  margin-top: var(--space-500);
}

.ch-h2 {
  margin: 0 0 var(--space-200);
  font-size: 1.125rem;
  font-weight: 600;
  line-height: 1.2;
}

.ch-list {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-border, #e7e5e4);
}

.ch-row {
  display: flex;
  align-items: center;
  gap: var(--space-300);
  min-height: 56px;
  padding-block: var(--space-300);
  border-bottom: 1px solid var(--color-border, #e7e5e4);
  color: inherit;
  text-decoration: none;
}

.ch-row:hover strong,
.ch-row:focus-visible strong {
  text-decoration: underline;
}

.ch-row__text {
  display: grid;
  flex: 1 1 auto;
  min-width: 0;
}

.ch-row__sub {
  color: var(--color-text-light);
  font-size: 0.9375rem;
}

.ch-row__icon {
  flex: 0 0 auto;
  color: var(--color-text-light);
}

.ch-back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-100, 4px);
  margin-top: var(--space-500);
  color: var(--color-text-light);
  font-size: 0.9375rem;
  text-decoration: none;
}

/* Desktop: Zeilen zweispaltig, Karte bleibt schmal */
@media (min-width: 768px) {
  .ch-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    column-gap: var(--space-600, 32px);
  }
}
</style>
