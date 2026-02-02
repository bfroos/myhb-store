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

const pageLoaded = await fetchPage(pageParam.value, categorySlug.value);

if (pageLoaded) {
  await setPageSeo(seo.value);
}

function handlePageChange(page: number) {
  if (page === 1) {
    router.push({ path: `/blog/c/${categorySlug.value}` });
  } else {
    router.push({
      path: `/blog/c/${categorySlug.value}/p/${page}`,
    });
  }
}
</script>
