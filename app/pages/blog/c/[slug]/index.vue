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
  await setPageSeo(seo.value);
}

</script>
