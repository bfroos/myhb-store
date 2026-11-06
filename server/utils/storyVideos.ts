/**
 * Kundenvideos mit eigener Seite (/videos/<slug>) fuer die Sitemaps.
 * Dieselbe Logik wie die Seite (shared/storyVideos.ts): nur Stories mit
 * Video, bekanntem Standort und Vorschaubild.
 */
import qs from "qs";
import { buildStoryVideos, hasStoryThumb, STORIES_QUERY, type StoryVideo } from "#shared/storyVideos";

export async function fetchStoryVideos(strapiUrl: string): Promise<StoryVideo[]> {
  const base = strapiUrl.replace(/\/+$/, "");
  const response = await $fetch<{ data?: any[] }>(
    `${base}/api/stories?${qs.stringify(STORIES_QUERY, { encodeValuesOnly: true })}`,
  );
  return buildStoryVideos(response.data ?? [], hasStoryThumb);
}
