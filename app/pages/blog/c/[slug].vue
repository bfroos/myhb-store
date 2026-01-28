<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <PagesBlogPageHeader
    :headline="$t('blog.headline')"
    :categories="categories"
  />
  <PagesBlogPageArticles
    :articles="articles"
    :pagination="pagination"
    @page-change="handlePageChange"
    spacing="sibling"
  />
  <BlockRenderer v-if="blocks && blocks.length > 0" :blocks="blocks" />
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const categorySlug = computed(() => route.params.slug as string);
const currentPage = computed(() => {
  const page = Number(route.query.page) || 1;
  return Math.max(1, page);
});

const {
  fetchPage,
  seo,
  blocks,
  articles,
  categories,
  pagination,
  breadcrumbItems,
} = useBlogPage();

const pageLoaded = await fetchPage(currentPage.value, categorySlug.value);

if (pageLoaded) {
  await setPageSeo(seo.value);
}

async function handlePageChange(page: number) {
  await router.push({
    query: {
      ...route.query,
      page,
    },
  });
  await fetchPage(page, categorySlug.value);
}
</script>
