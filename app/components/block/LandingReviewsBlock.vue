<template>
  <section class="block reviews" :class="[themeClass, { 'block--elevated': elevated }]">
    <header class="reviews__header">
      <div class="reviews__rating">
        <span class="reviews__stars" aria-hidden="true">
          <IconStarFilled v-for="i in 5" :key="i" :size="20" />
        </span>
        <strong class="reviews__score">{{ rating.toFixed(1) }}</strong>
      </div>
      <p class="reviews__sub">
        Basierend auf <strong>{{ count }}</strong> Google-Bewertungen
      </p>
    </header>

    <ul v-if="reviews?.length" class="reviews__list" role="list">
      <li v-for="r in reviews" :key="r.author" class="reviews__item">
        <header class="reviews__item-head">
          <span class="reviews__avatar" :style="{ background: r.color || '#e8e7e8' }">
            {{ initial(r.author) }}
          </span>
          <div class="reviews__meta">
            <strong class="reviews__author">{{ r.author }}</strong>
            <span class="reviews__date">{{ r.date }}</span>
          </div>
          <span class="reviews__item-stars" aria-hidden="true">
            <IconStarFilled v-for="i in r.stars" :key="i" :size="13" />
          </span>
        </header>
        <p class="reviews__quote">{{ r.quote }}</p>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { IconStarFilled } from "@tabler/icons-vue";

interface Review { author: string; date: string; stars: number; quote: string; color?: string }

withDefaults(defineProps<{
  rating?: number;
  count?: string;
  reviews?: Review[];
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  rating: 5.0,
  count: "2.700+",
  elevated: true,
  themeClass: "theme-light",
  reviews: () => [
    { author: "Jana M.",   date: "vor 2 Wochen", stars: 5, quote: "Sehr nettes Team, professionelle Beratung. Ergebnis sieht absolut natürlich aus!", color: "#e3d7cb" },
    { author: "Sebastian K.", date: "vor 1 Monat",  stars: 5, quote: "Schneller Termin, kompetente Ärztin, kein Druck. Komme gerne wieder.",          color: "#cdd5d8" },
    { author: "Lara F.",   date: "vor 3 Monaten", stars: 5, quote: "Wirklich angenehme Atmosphäre — ich war zuerst skeptisch, jetzt überzeugt.",       color: "#d9c8c0" },
  ],
});

function initial(name: string) { return name.charAt(0).toUpperCase(); }
</script>

<style scoped>
.block {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  padding: var(--space-card-pad);
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}
.block--elevated { box-shadow: var(--shadow-1); }

.reviews__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-200);
  padding-bottom: var(--space-400);
  border-bottom: 1px solid var(--color-border-mute);
}
.reviews__rating { display: inline-flex; align-items: center; gap: var(--space-300); }
.reviews__stars { display: inline-flex; gap: 2px; color: var(--color-text); }
.reviews__score {
  font-size: var(--font-2xl);
  line-height: 1;
  font-weight: var(--font-bold);
  letter-spacing: -0.01em;
}
.reviews__sub { margin: 0; font-size: var(--font-sm); color: var(--color-text-light); }
.reviews__list { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: var(--space-500); }
.reviews__item-head {
  display: grid;
  grid-template-columns: 36px 1fr auto;
  align-items: center;
  gap: var(--space-300);
  margin-bottom: var(--space-200);
}
.reviews__avatar {
  width: 36px; height: 36px; border-radius: 999px;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: var(--font-sm); font-weight: var(--font-bold);
  color: var(--color-text);
}
.reviews__meta { display: flex; flex-direction: column; line-height: 1.2; }
.reviews__author { font-size: var(--font-sm); font-weight: var(--font-bold); }
.reviews__date { font-size: var(--font-xs); color: var(--color-text-muted); }
.reviews__item-stars { color: var(--color-text); display: inline-flex; gap: 1px; }
.reviews__quote {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}
</style>
