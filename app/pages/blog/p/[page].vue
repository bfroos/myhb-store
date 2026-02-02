<template>
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <PagesBlogPageHeader
    :headline="$t('blog.headline')"
    :categories="categories"
  />
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

const pageParam = computed(() => {
  const p = Number(route.params.page) || 1;
  return Math.max(1, p);
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

const pageLoaded = await fetchPage(pageParam.value);

if (pageLoaded) {
  await setPageSeo(seo.value);
}

function handlePageChange(page: number) {
  if (page === 1) {
    router.push({ path: "/blog" });
  } else {
    router.push({ path: `/blog/p/${page}` });
  }
}
</script>
