<template>
  <dl class="seo-facts">
    <div v-for="f in facts" :key="f.key" class="seo-facts__row">
      <dt>{{ f.label }}</dt>
      <dd>{{ f.value }}</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { AdsV2Fact } from "#shared/adsTemplateV2Content";

defineProps<{ facts: AdsV2Fact[] }>();
</script>
