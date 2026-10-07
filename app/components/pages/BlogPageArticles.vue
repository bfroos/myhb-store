<template>
  <UiLayoutSectionBlock>
    <div v-if="articles && articles.length > 0" class="blogPageArticles">
      <UiMoleculeBlogArticleTeaser
        v-for="article in articles"
        :key="article.id"
        :slug="article.slug"
        :headline="article.headline"
        :intro="article.intro"
        :displayDate="article.displayDate"
        :cover="article.cover"
        :category="article.category"
      />
    </div>
    <BaseEmptyState
      v-else
      :title="$t('blog.emptyState.title')"
      :description="$t('blog.emptyState.description')"
      inline
    />
    <!-- TSEO-06: echte Links statt PrimeVue-Buttons, damit Google die
         Folgeseiten findet (vorher waren nur die ersten 9 Artikel verlinkt).
         Optik wie der fruehere PrimeVue-Paginator. -->
    <nav
      v-if="pagination && pagination.pageCount > 1 && articles && articles.length > 0"
      class="blogPageArticles__paginator"
      :aria-label="$t('blog.pagination')"
    >
      <ul class="pager">
        <li>
          <component :is="current > 1 ? NuxtLinkLocale : 'span'" :to="current > 1 ? pageTo(1) : undefined" class="pager__link" :class="{ 'is-disabled': current <= 1 }" :aria-label="$t('blog.firstPage')">
            <IconChevronsLeft :size="16" aria-hidden="true" />
          </component>
        </li>
        <li>
          <component :is="current > 1 ? NuxtLinkLocale : 'span'" :to="current > 1 ? pageTo(current - 1) : undefined" :rel="current > 1 ? 'prev' : undefined" class="pager__link" :class="{ 'is-disabled': current <= 1 }" :aria-label="$t('blog.previousPage')">
            <IconChevronLeft :size="16" aria-hidden="true" />
          </component>
        </li>
        <li v-for="n in pageWindow" :key="n">
          <NuxtLinkLocale :to="pageTo(n)" class="pager__link pager__page" :class="{ 'is-current': n === current }" :aria-current="n === current ? 'page' : undefined">
            {{ n }}
          </NuxtLinkLocale>
        </li>
        <li>
          <component :is="current < last ? NuxtLinkLocale : 'span'" :to="current < last ? pageTo(current + 1) : undefined" :rel="current < last ? 'next' : undefined" class="pager__link" :class="{ 'is-disabled': current >= last }" :aria-label="$t('blog.nextPage')">
            <IconChevronRight :size="16" aria-hidden="true" />
          </component>
        </li>
        <li>
          <component :is="current < last ? NuxtLinkLocale : 'span'" :to="current < last ? pageTo(last) : undefined" class="pager__link" :class="{ 'is-disabled': current >= last }" :aria-label="$t('blog.lastPage')">
            <IconChevronsRight :size="16" aria-hidden="true" />
          </component>
        </li>
      </ul>
    </nav>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-vue";
import type { BlogArticleDto } from "~/lib/strapi/dto/collections";

const props = defineProps<{
  articles: BlogArticleDto[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  } | null;
  /** Uebersicht ohne Sprachpraefix, z. B. "/blog" oder "/blog/c/botox" */
  basePath: string;
}>();

const NuxtLinkLocale = resolveComponent("NuxtLinkLocale");

const current = computed(() => props.pagination?.page ?? 1);
const last = computed(() => Math.max(1, props.pagination?.pageCount ?? 1));

/** Seite 1 ist die Uebersicht selbst, /p/1 leitet dorthin um (TSEO-09). */
const pageTo = (n: number) => (n <= 1 ? props.basePath : `${props.basePath}/p/${n}`);

/** Fuenf Seitenzahlen rund um die aktuelle, wie zuvor bei PrimeVue. */
const pageWindow = computed(() => {
  const size = Math.min(5, last.value);
  let start = Math.max(1, current.value - Math.floor(size / 2));
  start = Math.min(start, last.value - size + 1);
  return Array.from({ length: size }, (_, i) => start + i);
});
</script>
<style scoped>
.blogPageArticles {
  display: grid;
  gap: var(--space-bento-gap-sm);
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  margin-bottom: var(--space-bento-gap-sm);
}

.blogPageArticles__paginator {
  margin-top: var(--space-bento-gap-sm);
}

.pager {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: var(--space-100);
  margin: 0;
  padding: var(--space-200) var(--space-400);
  list-style: none;
  border-radius: var(--border-radius-card);
  background: var(--color-card-bg-strong);
}

.pager__link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 2.5rem;
  padding: var(--space-200) var(--space-400);
  border-radius: var(--border-radius-400);
  color: var(--color-white);
  text-decoration: none;
}

.pager__link:hover:not(.is-disabled),
.pager__link.is-current {
  background: var(--color-gray-800);
}

.pager__link:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.pager__link.is-disabled {
  opacity: 0.4;
}
</style>
