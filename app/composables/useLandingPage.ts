import type { SharedSeoDto } from "~/lib/strapi/dto/components";

type PuckContent = {
  type: string;
  props: Record<string, unknown>;
};

type PuckData = {
  content: PuckContent[];
  root?: unknown;
  zones?: unknown;
};

type LandingPageTemplate = {
  id: number;
  json: PuckData | null;
};

export function useLandingPage() {
  const route = useRoute();
  const { t } = useI18n();

  const slug = route.params.slug as string;
  const seo = ref<SharedSeoDto | null>(null);
  const templateJson = ref<PuckData | null>(null);

  async function fetchLandingPage(): Promise<boolean> {
    const { data, error } = await useStrapiFetch<any>("/landing-pages", {
      query: {
        "filters[slug][$eq]": slug,
        "populate[template]": "true",
        "populate[seo][populate]": "openGraph",
      },
      fetchOptions: {
        key: `landing-page:${slug}`,
      },
    });

    if (error.value) {
      throw handleFetchError(error.value, t);
    }

    const page = data.value?.data?.[0];
    if (!page) {
      throw handleNotFound(t);
    }

    seo.value = page.seo ?? null;

    const template = page.template as LandingPageTemplate | null;
    templateJson.value = template?.json ?? null;

    return true;
  }

  return { fetchLandingPage, seo, templateJson };
}
