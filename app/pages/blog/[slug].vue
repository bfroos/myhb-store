<template>
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
  await setPageSeo(seo.value, article.value?.cover);
}

// Schema.org BlogPosting
const config = useRuntimeConfig();
const globals = useGlobals();
const route = useRoute();

const blogPostingSchema = computed(() =>
  buildBlogPostingSchema(article.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: globals.value?.brand?.name,
  }),
);

useSchemaOrg(blogPostingSchema);
</script>
