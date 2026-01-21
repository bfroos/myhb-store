<template>
  <BaseAppHeader />
  <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
  <PagesBlogArticleBlock
    :headline="article?.headline"
    :intro="article?.intro"
    :cover="article?.cover"
    :components="article?.components"
    :displayDate="article?.displayDate"
    :footnotes="article?.footnotes"
  />
</template>

<script setup lang="ts">
const { fetchPage, seo, article, breadcrumbItems } = useBlogArticlePage();

const pageLoaded = await fetchPage();

if (pageLoaded) {
  await setPageSeo(seo.value);
}
</script>
