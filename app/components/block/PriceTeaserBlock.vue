<template>
  <section class="block teaser" :class="[themeClass, { 'block--elevated': elevated }]">
    <div class="teaser__layout">
      <header class="teaser__header">
        <p v-if="eyebrow" class="teaser__eyebrow">{{ eyebrow }}</p>
        <h2 v-if="headline" class="teaser__heading">{{ headline }}</h2>
        <p v-if="subline" class="teaser__subline">{{ subline }}</p>
      </header>

      <ul class="teaser__list" role="list">
        <li
          v-for="item in visibleItems"
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

    <footer class="teaser__footer">
      <a
        v-if="cta"
        :href="cta.href ?? '#'"
        class="button button--tertiary button--lg button--fullWidth"
        @click="$emit('cta', $event)"
      >
        <span>{{ cta.label }}</span>
        <IconArrowRight :size="18" stroke="1.75" aria-hidden="true" />
      </a>
      <p v-if="footnote" class="teaser__footnote">{{ footnote }}</p>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IconArrowRight } from "@tabler/icons-vue";

type PriceTeaserSource = "manual" | "context";

interface PriceItem {
  label: string;
  price: number | string; // 149.99 → "149,99 €", or pass a pre-formatted string
  from?: boolean;         // prefix "ab"
  href?: string;          // turns row into an <a>
}
interface CtaProp {
  label: string;
  href?: string;
}
interface PriceTeaserContextResponse {
  data?: {
    items?: PriceItem[];
  };
}
type PriceTeaserContextQuery = {
  type?: "treatment-page" | "product";
  locale?: string;
  pathKey?: string;
  productSlug?: string;
  limit?: number;
};

const props = withDefaults(defineProps<{
  eyebrow?: string;
  headline?: string;
  subline?: string;
  items?: PriceItem[];
  source?: PriceTeaserSource;
  /** Cap how many rows to show; rest is reachable via the CTA. */
  limit?: number;
  cta?: CtaProp;
  footnote?: string;
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
  currency?: string;
  locale?: string;
}>(), {
  elevated: true,
  themeClass: "theme-light",
  limit: 5,
  currency: "EUR",
  locale: "de-DE",
  eyebrow: "Preise",
  headline: "Faltenbehandlung (BTX)",
  subline: "Transparente Preise — keine versteckten Kosten.",
  items: () => [
    { label: "Zornesfalte glätten",          price: 149.99, from: true, href: "#" },
    { label: "Stirnfalte",                   price: 149.99, from: true, href: "#" },
    { label: "Krähenfüße & Augenfältchen",   price: 149.99, from: true, href: "#" },
    { label: "Baby Muskelrelaxans",          price: 149.99, from: true, href: "#" },
    { label: "Full Face",                    price: 499.99, from: true, href: "#" },
  ],
  source: "manual",
  cta: () => ({ label: "Alle Preise ansehen", href: "/preise" }),
  footnote: "",
});

defineEmits<{ cta: [event: MouseEvent] }>();

const route = useRoute();
const { locale: i18nLocale } = useI18n();

const routePathKey = computed(() => {
  const treatmentSlug = route.params.treatmentSlug;
  const slug = route.params.slug;
  const value = treatmentSlug ?? slug;

  if (Array.isArray(value)) return value.filter(Boolean).join("/");
  return typeof value === "string" ? value : "";
});

const contextQuery = computed<PriceTeaserContextQuery>(() => {
  if (props.source !== "context") return {};

  if (route.path.startsWith("/behandlungen/") && routePathKey.value) {
    return {
      type: "treatment-page",
      locale: i18nLocale.value,
      pathKey: routePathKey.value,
      limit: props.limit,
    };
  }

  if (route.path.startsWith("/standorte/") && routePathKey.value) {
    return {
      type: "treatment-page",
      locale: i18nLocale.value,
      pathKey: routePathKey.value,
      limit: props.limit,
    };
  }

  const productSlug = route.params.productSlug;
  if (route.path.startsWith("/produkte/") && typeof productSlug === "string") {
    return {
      type: "product",
      locale: i18nLocale.value,
      productSlug,
      limit: props.limit,
    };
  }

  return {};
});

const shouldFetchContext = computed(
  () => props.source === "context" && Boolean(contextQuery.value.type),
);

const { data: contextData } = useStrapiFetch<PriceTeaserContextResponse>(
  "/price-teasers/context",
  {
    query: contextQuery,
    fetchOptions: {
      immediate: shouldFetchContext.value,
      key: computed(() => {
        const query = contextQuery.value;
        return `price-teaser:${query.type ?? "manual"}:${query.locale ?? ""}:${query.pathKey ?? query.productSlug ?? ""}:${query.limit ?? ""}`;
      }),
    },
  },
);

const items = computed(() => {
  const contextItems = contextData.value?.data?.items ?? [];
  if (props.source === "context" && contextItems.length > 0) {
    return contextItems;
  }

  return props.items;
});

const visibleItems = computed(() =>
  typeof props.limit === "number" ? items.value.slice(0, props.limit) : items.value,
);

function formatPrice(p: number | string) {
  if (typeof p === "string") return p;
  return new Intl.NumberFormat(props.locale, {
    style: "currency",
    currency: props.currency,
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

/* Compatible pill-button rules — match BaseButton when used standalone */
.button {
  height: var(--control-height-lg);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-200);
  padding: 0 calc(var(--control-height-lg) / 2);
  border-radius: 999px;
  border: 2px solid var(--button-tertiary-color-border, #000);
  font: inherit;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  line-height: 1;
  text-decoration: none;
  cursor: pointer;
  background: transparent;
  color: var(--button-tertiary-color-text, #000);
  transition: all 0.15s linear;
}
.button--fullWidth { width: 100%; }
.button:hover { background: rgba(0,0,0,0.04); }
.button:active { transform: scale(0.97); }

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
