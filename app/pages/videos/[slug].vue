<template>
  <div v-if="video" class="vs">
    <div class="vs__breite">
      <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
      <article class="vs__einzel">
        <div class="vs__player">
          <video
            :src="video.videoUrl"
            :poster="video.thumbPath"
            controls
            preload="metadata"
            playsinline
            width="720"
            height="1280"
          />
        </div>
        <div class="vs__text">
          <h1>{{ video.h1 }}</h1>
          <p v-for="(s, i) in paragraphs" :key="i">{{ s }}</p>
          <ul class="vs__links" role="list">
            <li>
              <NuxtLink :to="video.linkPath" class="vs__knopf">{{ video.linkText }}</NuxtLink>
            </li>
            <li>
              <NuxtLink :to="VIDEOS_PATH" class="vs__knopf vs__knopf--rand">Alle Videos ansehen</NuxtLink>
            </li>
          </ul>
        </div>
      </article>

      <section v-if="related.length" class="vs__gruppe" aria-labelledby="weitere-videos">
        <h2 id="weitere-videos">Weitere Videos: {{ video.group }}</h2>
        <ul class="vs__raster" role="list">
          <li v-for="v in related" :key="v.slug">
            <NuxtLink :to="`${VIDEOS_PATH}/${v.slug}`" class="vs__kachel">
              <img :src="v.thumbPath" :alt="v.h1" width="360" height="640" loading="lazy" decoding="async">
              <span class="vs__kachelTitel">{{ v.title }}</span>
              <span class="vs__kachelOrt">{{ v.location.name }}</span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Eine Seite je Kundenvideo (E24): das Video ist der Hauptinhalt, dazu ein
 * kurzer Text, der Link auf "Behandlung je Standort" und ein VideoObject.
 * Slug und Texte: shared/storyVideos.ts. Nur www.
 */
import { storyVideoSchema, VIDEOS_PATH } from "#shared/storyVideos";

const route = useRoute();
const slug = String(route.params.slug ?? "");
const { videos, siteUrl } = await useStoryVideos();
const video = computed(() => videos.value.find((v) => v.slug === slug) ?? null);
if (!video.value) {
  throw createError({ statusCode: 404, statusMessage: "Not found", fatal: true });
}

// Erster Satz als eigener Absatz, der Rest zusammen.
const paragraphs = computed(() => {
  const s = video.value?.sentences ?? [];
  return s.length > 1 ? [s[0]!, s.slice(1).join(" ")] : s;
});

const related = computed(() => {
  const v = video.value;
  if (!v) return [];
  const others = videos.value.filter((x) => x.slug !== v.slug);
  const sameGroup = others.filter((x) => x.group === v.group);
  const sameLocation = others.filter((x) => x.group !== v.group && x.location.path === v.location.path);
  return [...sameGroup, ...sameLocation].slice(0, 4);
});

const breadcrumbItems = computed(() => [
  { title: "Videos", to: VIDEOS_PATH },
  { title: video.value?.title ?? "" },
]);

const url = `${siteUrl}${VIDEOS_PATH}/${slug}`;
const title = computed(() => `${video.value?.h1} | MY HEALTH & BEAUTY`);
const thumb = computed(() => `${siteUrl}${video.value?.thumbPath}`);

useHead({
  title,
  link: [{ rel: "canonical", href: url }],
  meta: [
    { name: "description", content: () => video.value?.description ?? "" },
    { name: "robots", content: "index, follow" },
    { property: "og:title", content: title },
    { property: "og:description", content: () => video.value?.description ?? "" },
    { property: "og:url", content: url },
    { property: "og:type", content: "video.other" },
    { property: "og:image", content: thumb },
    { property: "og:video", content: () => video.value?.videoUrl ?? "" },
  ],
});
useSchemaOrg(computed(() => (video.value ? storyVideoSchema(video.value, siteUrl) : null)));
</script>

<style src="~/assets/css/video-seiten.css"></style>
