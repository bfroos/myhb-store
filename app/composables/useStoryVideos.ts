import { buildStoryVideos, hasStoryThumb, STORIES_QUERY, type StoryVideo } from "#shared/storyVideos";

/**
 * Alle Kundenvideos mit eigener Seite (/videos, /videos/<slug>), siehe
 * shared/storyVideos.ts. Nur www: im Ads-Modus 404.
 */
export async function useStoryVideos() {
  // Alles mit Nuxt-Kontext vor dem await (danach ist die Instanz weg).
  const config = useRuntimeConfig();
  const siteUrl = ((config.public.publicUrl as string) || "https://www.myhealthandbeauty.com").replace(/\/+$/, "");
  const { isAdsMode } = useSiteModeFlags();
  if (isAdsMode.value) {
    throw createError({ statusCode: 404, statusMessage: "Not found", fatal: true });
  }

  const request = useAsyncData("story-videos", () =>
    strapiFetch<{ data?: any[] }>("/stories", { query: { ...STORIES_QUERY } }),
  );
  const videos = computed<StoryVideo[]>(() => buildStoryVideos(request.data.value?.data ?? [], hasStoryThumb));
  await request;

  return { videos, siteUrl };
}
