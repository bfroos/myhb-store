<template>
  <UiLayoutSectionBlock v-if="articles && articles.length">
    <section class="relatedArticles" aria-labelledby="related-articles-heading">
      <h2 id="related-articles-heading" class="relatedArticles__headline">
        {{ headline }}
      </h2>
      <ul class="relatedArticles__grid">
        <li
          v-for="article in articles"
          :key="article.slug"
          class="relatedArticles__item"
        >
          <NuxtLinkLocale
            :to="`/blog/${article.slug}`"
            class="relatedArticles__link"
          >
            <img
              v-if="article.cover?.url"
              :src="article.cover.url"
              :alt="article.cover?.alternativeText || article.headline"
              class="relatedArticles__img"
              loading="lazy"
            />
            <span class="relatedArticles__title">{{ article.headline }}</span>
          </NuxtLinkLocale>
        </li>
      </ul>
    </section>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlogArticleDto } from "~/lib/strapi/dto/collections";

withDefaults(
  defineProps<{
    articles: BlogArticleDto[];
    headline?: string;
  }>(),
  {
    headline: "Aus unserem Ratgeber",
  },
);
</script>

<style scoped>
.relatedArticles__headline {
  margin: 0 0 var(--space-500, 1.5rem);
  font-size: var(--font-xl, 1.5rem);
  color: var(--color-black, #111);
}

.relatedArticles__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-400, 1rem);
  margin: 0;
  padding: 0;
  list-style: none;
}

.relatedArticles__link {
  display: flex;
  flex-direction: column;
  gap: var(--space-200, 0.5rem);
  color: inherit;
  text-decoration: none;
}

.relatedArticles__img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  border-radius: var(--space-200, 0.5rem);
}

.relatedArticles__title {
  font-weight: 600;
  color: var(--color-black, #111);
}

.relatedArticles__link:hover .relatedArticles__title,
.relatedArticles__link:focus-visible .relatedArticles__title {
  text-decoration: underline;
}
</style>
