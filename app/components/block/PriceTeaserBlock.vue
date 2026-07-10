<template>
  <section class="block teaser" :class="[themeClass, { 'block--elevated': elevated }]">
    <div class="teaser__layout">
      <header class="teaser__header">
        <p v-if="eyebrow" class="teaser__eyebrow">{{ eyebrow }}</p>
        <h2 v-if="headline" class="teaser__heading">{{ headline }}</h2>
        <p v-if="subline" class="teaser__subline">{{ subline }}</p>
      </header>

      <ul v-if="items.length > 0" class="teaser__list" role="list">
        <li
          v-for="item in items"
          :key="item.label"
          class="teaser__row"
        >
          <component
            :is="rowComponent(item)"
            class="teaser__rowInner"
            :href="item.href ?? undefined"
          >
            <span class="teaser__label">{{ item.label }}</span>
            <span class="teaser__price">
              <span v-if="item.from" class="teaser__from">ab</span>
              {{ formatPrice(item.price) }}
            </span>
            <IconArrowRight
              v-if="item.href"
              :size="20"
              stroke="1.75"
              class="teaser__arrow"
              aria-hidden="true"
            />
          </component>
        </li>
      </ul>
    </div>

    <footer v-if="cta || footnote" class="teaser__footer">
      <SharedButton
        v-if="cta"
        :button="cta"
        :button-props="{ variant: 'tertiary', size: 'lg', fullWidth: true }"
      />
      <p v-if="footnote" class="teaser__footnote">{{ footnote }}</p>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IconArrowRight } from "@tabler/icons-vue";
import type { SharedButtonDto } from "~/lib/strapi/dto/components";

interface PriceItem {
  label: string;
  price: number;
  from?: boolean; // Präfix "ab"
  href?: string;  // macht die Zeile zu einem <a>
}
interface TreatmentRef {
  id?: number | string;
  name: string;
  priceInEuroCent?: number;
  isStartingPrice?: boolean;
  treatmentPage?: { pathKey?: string } | null;
}

const props = withDefaults(defineProps<{
  eyebrow?: string;
  headline?: string;
  subline?: string;
  /** In Strapi ausgewählte Behandlungen (Preisquelle). */
  treatments?: TreatmentRef[];
  cta?: SharedButtonDto | null;
  footnote?: string;
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
  treatments: () => [],
  cta: null,
  footnote: "",
});

// Ausgewählte Behandlungen → Preiszeilen
const items = computed<PriceItem[]>(() =>
  (props.treatments ?? [])
    .filter((t): t is TreatmentRef => Boolean(t && t.name))
    .map((t) => ({
      label: t.name,
      price: (t.priceInEuroCent ?? 0) / 100,
      from: t.isStartingPrice ?? false,
      href: t.treatmentPage?.pathKey
        ? `/behandlungen/${t.treatmentPage.pathKey}`
        : undefined,
    })),
);

function formatPrice(p: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(p);
}

function rowComponent(item: PriceItem) {
  return item.href ? "a" : "div";
}
</script>

<style scoped>
.block {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  overflow: hidden;
}
.block--elevated { box-shadow: var(--shadow-1); }

.teaser__layout {
  display: grid;
  grid-template-columns: 1fr;
  padding: var(--space-card-pad);
  gap: var(--space-500);
}
@media (min-width: 720px) {
  .teaser__layout { grid-template-columns: 1fr 1.4fr; gap: var(--space-700); padding: var(--space-card-pad-lg, 32px); align-items: start; }
  .teaser__heading { font-size: var(--font-4xl); line-height: var(--line-4xl); }
}

.teaser__header { display: flex; flex-direction: column; gap: var(--space-200); }
.teaser__eyebrow {
  margin: 0;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-light);
}
.teaser__heading {
  margin: 0;
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
  text-wrap: balance;
}
.teaser__subline {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.teaser__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}
.teaser__row { border-top: 1px solid var(--color-border-mute); }
.teaser__row:first-child { border-top: 0; }

.teaser__rowInner {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: var(--space-300);
  padding: var(--space-400) 0;
  text-decoration: none;
  color: var(--color-text);
  font-size: var(--font-md);
  line-height: var(--line-md);
  transition: color 0.12s linear;
}
a.teaser__rowInner { cursor: pointer; }
a.teaser__rowInner:hover .teaser__arrow { transform: translateX(2px); }
a.teaser__rowInner:hover .teaser__label { color: var(--color-text); }

.teaser__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.teaser__price {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-bold);
  white-space: nowrap;
}
.teaser__from {
  font-weight: var(--font-regular);
  font-size: var(--font-sm);
  color: var(--color-text-light);
}
.teaser__arrow {
  color: var(--color-text);
  transition: transform 0.15s ease;
  flex-shrink: 0;
}

.teaser__footer {
  padding: var(--space-card-pad);
  padding-top: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}
.teaser__footnote {
  margin: 0;
  text-align: center;
  font-size: var(--font-xs);
  color: var(--color-text-light);
}

/* Two-column layout on wider viewports — like the screenshot */
@media (min-width: 720px) {
  .teaser__layout {
    grid-template-columns: minmax(180px, 0.5fr) 1fr;
    gap: var(--space-800);
  }
  .teaser__heading {
    font-size: var(--font-4xl);
    line-height: var(--line-4xl);
  }
}
</style>
