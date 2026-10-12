<template>
  <!-- E24 SEO-Pilot: Absatz mit eigenen Links (shared/seoPilotLippen.ts) -->
  <component :is="tag">
    <template v-for="(part, i) in parts" :key="i">
      <template v-if="typeof part === 'string'">{{ part }}</template>
      <a v-else-if="/^https?:/.test(part.href)" :href="part.href" target="_blank" rel="noopener">{{ part.text }}</a>
      <NuxtLink v-else :to="part.href">{{ part.text }}</NuxtLink>
    </template>
  </component>
</template>

<script setup lang="ts">
import type { SeoParagraph } from "#shared/seoPilotLippen";

withDefaults(defineProps<{ parts: SeoParagraph; tag?: string }>(), { tag: "p" });
</script>
