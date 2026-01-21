<template>
  <UiLayoutRichText :blocks="content" />
</template>
<script setup lang="ts">
import type { StrapiRichText } from "~/lib/strapi/dto/types";

const props = defineProps<{
  content: StrapiRichText;
}>();
</script>
