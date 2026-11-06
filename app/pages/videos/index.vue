<template>
  <div class="vs">
    <div class="vs__breite">
      <UiOrganismBaseBreadcrumb :items="breadcrumbItems" />
      <header class="vs__kopf">
        <h1>Videos von unseren Kunden</h1>
        <p class="vs__lead">
          Kunden erzählen, wie sie ihre Behandlung bei MY HEALTH & BEAUTY erlebt haben: von Botox
          über Hyaluron bis zur Beratung. Jedes Video hat eine eigene Seite mit dem Standort und
          der passenden Behandlung.
        </p>
      </header>

      <section v-for="g in groups" :key="g.group" class="vs__gruppe" :aria-labelledby="`gruppe-${slugify(g.group)}`">
        <h2 :id="`gruppe-${slugify(g.group)}`">{{ g.group }}</h2>
        <ul class="vs__raster" role="list">
          <li v-for="v in g.videos" :key="v.slug">
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
 * Uebersicht aller Kundenvideos (E24), gruppiert nach Behandlung. Jede Kachel
 * fuehrt auf die Einzelseite, damit Google das Video dort als Hauptinhalt
 * findet. Nur www (useStoryVideos wirft im Ads-Modus 404).
 */
import { groupStoryVideos, slugify, VIDEOS_PATH } from "#shared/storyVideos";

const { videos, siteUrl } = await useStoryVideos();
const groups = computed(() => groupStoryVideos(videos.value));

const breadcrumbItems = [{ title: "Videos" }];

const title = "Kundenvideos: Erfahrungen mit Botox, Hyaluron und mehr | MY HEALTH & BEAUTY";
const description =
  "Kunden erzählen von ihrer Behandlung bei MY HEALTH & BEAUTY: Botox, Hyaluron, Vampir-Lifting und Beratung an unseren Standorten, jeweils im Video.";

useHead({
  title,
  link: [{ rel: "canonical", href: `${siteUrl}${VIDEOS_PATH}` }],
  meta: [
    { name: "description", content: description },
    { name: "robots", content: "index, follow" },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: `${siteUrl}${VIDEOS_PATH}` },
    { property: "og:type", content: "website" },
  ],
});
</script>

<style src="~/assets/css/video-seiten.css"></style>
