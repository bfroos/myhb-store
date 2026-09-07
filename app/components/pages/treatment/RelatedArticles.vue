<template>
  <UiLayoutSectionBlock v-if="articles && articles.length">
    <UiLayoutCardSurface>
      <section class="relatedArticles" aria-labelledby="related-articles-heading">
        <h2 id="related-articles-heading" class="relatedArticles__headline">
          {{ headline ?? $t("treatment.relatedArticles.headline") }}
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
              <UiAtomMediaPicture
                v-if="article.cover?.url"
                :media="article.cover"
                :default-format="ImageFormat.SMALL"
                :alt="article.cover?.alternativeText || article.headline"
                class="relatedArticles__picture"
              />
              <span class="relatedArticles__title">{{ article.headline }}</span>
            </NuxtLinkLocale>
          </li>
        </ul>
      </section>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { ImageFormat } from "~/lib/strapi/dto/enums";
import type { BlogArticleDto } from "~/lib/strapi/dto/collections";

defineProps<{
  articles: BlogArticleDto[];
  headline?: string;
}>();
</script>

<style scoped>
.relatedArticles {
  padding: var(--space-card-pad);
}

.relatedArticles__headline {
  margin: 0 0 var(--space-500, 1.5rem);
  color: var(--color-black, #111);
}

.relatedArticles__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(330px, 100%), 1fr));
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

.relatedArticles__picture {
  display: block;
  width: 100%;
}

.relatedArticles__picture :deep(img) {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: contain;
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
