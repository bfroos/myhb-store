<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <PagesBlogPageHeader
    :headline="$t('blog.headline')"
    :categories="categories"
  />
  <PagesBlogPageArticles
    :articles="articles"
    :pagination="pagination"
    :base-path="`/blog/c/${categorySlug}`"
    spacing="sibling"
  />
  <BlockRenderer v-if="blocks && blocks.length > 0" :blocks="blocks" />
</template>

<script setup lang="ts">
import { blogCategoryLocaleSlugs } from "#shared/hreflang";

const route = useRoute();
const router = useRouter();

const categorySlug = computed(() => route.params.slug as string);

const {
  fetchPage,
  seo,
  blocks,
  articles,
  categories,
  pagination,
  breadcrumbItems,
} = useBlogPage();

const pageLoaded = await fetchPage(1, categorySlug.value);

if (pageLoaded) {
  // TSEO-Regression 07.10.2026: Kategorie-Slugs sind je Sprache verschieden
  // (haare / hair / cheveux ...). Alternates nur aus den Strapi-
  // Lokalisierungen der Kategorie; ohne sie nur die Seite selbst, nie der
  // Slug der aktuellen Sprache in fremden Sprachen (vorher 404).
  const { locale, fallbackLocale } = useI18n();
  const currentLocale = (locale.value || fallbackLocale.value) as string;
  const category = categories.value?.find(
    (entry) => entry.slug === categorySlug.value,
  );
  const localeSlugs = blogCategoryLocaleSlugs(
    currentLocale,
    categorySlug.value,
    category?.localizations,
  );
  if (localeSlugs) {
    usePageI18nParams(
      Object.entries(localeSlugs).map(([code, slug]) => ({ locale: code, slug })),
      "slug",
      "slug",
    );
  } else {
    usePageI18nSelfOnly();
  }
  await setPageSeo(seo.value);
}

</script>
