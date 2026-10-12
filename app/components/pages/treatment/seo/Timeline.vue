<template>
  <ol class="seo-timeline" role="list">
    <li v-for="(s, i) in steps" :key="i" class="seo-timeline__step">
      <span class="seo-timeline__when">{{ s.when }}</span>
      <strong class="seo-timeline__title">{{ s.title }}</strong>
      <p class="seo-timeline__text">{{ s.text }}</p>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { AdsV2TimelineItem } from "#shared/adsTemplateV2Content";

defineProps<{ steps: AdsV2TimelineItem[] }>();
</script>
