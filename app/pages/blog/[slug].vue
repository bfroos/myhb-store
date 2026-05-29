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
import { buildVideoObjectSchema } from "~/utils/schemaVideo";

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
    brandName: globals.value?.brand?.name ?? "",
  }),
);

// Schema.org VideoObject (für Blog Videos)
const videoSchema = computed(() => {
  const videos = article.value?.videos;
  if (!videos || videos.length === 0) {
    return null;
  }

  const builtVideos = videos.map((video: any) =>
    buildVideoObjectSchema({
      media: video,
      name: video.name || `${article.value?.headline || "Blog"} Video`,
      description: video.description || article.value?.intro || "Blog video",
      uploadDate: video.uploadedAt || article.value?.displayDate || new Date().toISOString(),
      duration: video.duration,
      embedUrl: video.embedUrl,
    }),
  ).filter((v): v is Record<string, unknown> => v !== null);

  if (builtVideos.length === 0) return null;
  if (builtVideos.length === 1) return builtVideos[0];

  // Multiple videos: wrap in WebPage collection
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${article.value?.headline || "Blog"} Videos`,
    url: route.path,
    video: builtVideos,
  };
});

useSchemaOrg(blogPostingSchema);
useSchemaOrg(videoSchema);
</script>
