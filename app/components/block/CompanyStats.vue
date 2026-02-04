<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <BlockCompanyStatsList />
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { CardSettingsDto } from "~/lib/strapi/dto/components";

defineProps<{
  cardSettings?: CardSettingsDto;
}>();
</script>
