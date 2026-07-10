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
const { fetchPage, seo, article, breadcrumbItems, localizations } = useBlogArticlePage();

const pageLoaded = await fetchPage();

if (pageLoaded) {
  await setPageSeo(seo.value, article.value?.cover);
  usePageI18nParams(localizations.value, "slug");
}

// Schema.org BlogPosting
const config = useRuntimeConfig();
const globals = useGlobals();
const appConfig = useAppConfig();
const route = useRoute();

const blogPostingSchema = computed(() => {
  const logoUrl = appConfig.seo?.organization?.logo?.url
    ? `${config.public.publicUrl}${appConfig.seo.organization.logo.url}`.replace(/([^:]\/)\/+/g, "$1")
    : appConfig.seo?.organization?.logo?.fallback;

  return buildBlogPostingSchema(article.value, {
    publicUrl: (config.public.publicUrl as string) || "",
    path: route.path,
    brandName: globals.value?.brand?.name ?? "",
    logoUrl,
  });
});

useSchemaOrg(blogPostingSchema);

// Schema.org FAQPage (nur wenn FAQ-Block im Artikel vorhanden)
const faqSchema = computed(() => {
  const components = (article.value?.components ?? []) as any[];

  const items = components.flatMap((block) => {
    // blocks.faq — relationsbasiert (faqs + faqSets)
    if (block?.__component === "blocks.faq") {
      const directFaqs = block.faqs ?? [];
      const faqSetsItems = (block.faqSets ?? []).flatMap(
        (set: any) => set.faqs ?? [],
      );
      return [...directFaqs, ...faqSetsItems].map((faq: any) => ({
        question: faq.question,
        answer: faq.answer,
      }));
    }

    // blocks.faq-accordion — self-contained { q, a }
    if (block?.__component === "blocks.faq-accordion") {
      return (block.items ?? []).map((item: any) => ({
        question: item.q,
        answer: [
          {
            type: "paragraph",
            children: [{ type: "text", text: item.a ?? "" }],
          },
        ],
      }));
    }

    return [];
  });

  return buildFaqPageSchema(items as any);
});

useSchemaOrg(faqSchema);
</script>
