<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <PagesBlogPageHeader
    :headline="$t('blog.headline')"
    :categories="categories"
  />
  <PagesBlogPageArticles
    base-path="/blog"
    :articles="articles"
    :pagination="pagination"
    spacing="sibling"
  />
  <BlockRenderer v-if="blocks && blocks.length > 0" :blocks="blocks" />
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

// TSEO-09: nur ganze Zahlen ab 2. Seite 1 ist die Uebersicht selbst (301),
// alles andere (0, abc, -1) eine 404 statt einer Kopie der ersten Seite.
const rawPage = String(route.params.page ?? "");
if (!/^[1-9]\d*$/.test(rawPage)) {
  throw handleNotFound(useI18n().t);
}
if (rawPage === "1") {
  await navigateTo(useLocalePath()("/blog"), { redirectCode: 301 });
}
const pageParam = computed(() => Number(rawPage));

const {
  fetchPage,
  seo,
  blocks,
  articles,
  categories,
  pagination,
  breadcrumbItems,
} = useBlogPage();

const pageLoaded = await fetchPage(pageParam.value);

if (pageLoaded) {
  // TSEO-Regression 07.10.2026: Blog-Folgeseiten sind je Sprache verschiedene Listen
  // (Artikel- und Seitenzahl weichen ab, Kategorie-Slugs sind uebersetzt).
  // Kein Alternate auf Seite n einer anderen Sprache, die es nicht geben muss.
  usePageI18nSelfOnly();
  await setPageSeo(seo.value);
}

</script>
