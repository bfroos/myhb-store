<template>
  <!-- Ratgeber-Layout (myhb-os#418): passende Kundenvideos im Artikel. Spielt
       direkt ab (preload none), jede Kachel fuehrt auch zur Videoseite. -->
  <section v-if="auswahl.length" class="bsv" data-track-placement="blog_story_videos">
    <h2 class="bsv__titel">So erleben Kunden die Behandlung</h2>
    <ul class="bsv__raster" role="list">
      <li v-for="v in auswahl" :key="v.slug" class="bsv__item">
        <video
          class="bsv__video"
          :src="v.videoUrl"
          :poster="v.thumbPath"
          preload="none"
          controls
          playsinline
          :aria-label="v.h1"
        />
        <NuxtLink :to="`${VIDEOS_PATH}/${v.slug}`" class="bsv__link">
          {{ v.title }}<span class="bsv__ort">{{ v.location.name }}</span>
        </NuxtLink>
      </li>
    </ul>
    <NuxtLink :to="VIDEOS_PATH" class="bsv__alle">Alle Kundenvideos ansehen →</NuxtLink>
  </section>
</template>

<script setup lang="ts">
import { pickStoryVideos, VIDEOS_PATH } from "#shared/storyVideos";

const props = defineProps<{ pathKey: string }>();
const { videos } = await useStoryVideos();
const auswahl = computed(() => pickStoryVideos(videos.value, props.pathKey, 3));
</script>

<style scoped>
.bsv {
  margin: 2.4em 0;
}
.bsv__titel {
  margin: 0 0 0.8em;
  font-size: clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem);
  line-height: 1.25;
}
.bsv__raster {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-400);
  margin: 0 0 1em;
  padding: 0;
  list-style: none;
}
.bsv__video {
  display: block;
  width: 100%;
  aspect-ratio: 9 / 16;
  object-fit: cover;
  background: #111;
  border-radius: var(--border-radius-400, 16px);
}
.bsv__link {
  display: block;
  overflow-wrap: anywhere;
  margin-top: 0.5em;
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  line-height: 1.35;
  color: inherit;
  text-decoration: none;
}
.bsv__ort {
  display: block;
  font-weight: normal;
  opacity: 0.7;
}
.bsv__alle {
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
