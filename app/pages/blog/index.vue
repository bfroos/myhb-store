<template>
  <BaseAppHeader />
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <PagesBlogPageHeader :headline="blogPage?.name" :categories="categories" />
  <PagesBlogPageArticles
    @page-change="handlePageChange"
    :articles="articles"
    :pagination="pagination"
    spacing="sibling"
  />
  <BlockRenderer v-if="blocks && blocks.length > 0" :blocks="blocks" />
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const currentPage = computed(() => {
  const page = Number(route.query.page) || 1;
  return Math.max(1, page);
});

const {
  fetchPage,
  seo,
  blocks,
  blogPage,
  articles,
  categories,
  pagination,
  breadcrumbItems,
} = useBlogPage();

const pageLoaded = await fetchPage(currentPage.value);

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
  await fetchPage(page);
}
</script>
