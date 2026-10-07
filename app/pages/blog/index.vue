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
const router = useRouter();

const {
  fetchPage,
  seo,
  blocks,
  articles,
  categories,
  pagination,
  breadcrumbItems,
} = useBlogPage();

const pageLoaded = await fetchPage(1);

if (pageLoaded) {
  await setPageSeo(seo.value);
}

</script>
