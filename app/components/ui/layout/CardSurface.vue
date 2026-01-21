<template>
  <div
    class="card"
    :class="{
      'theme-light':
        cardSettings?.colorTheme === ColorTheme.LIGHT ||
        !cardSettings?.colorTheme,
      'theme-soft': cardSettings?.colorTheme === ColorTheme.SOFT,
      'theme-neutral': cardSettings?.colorTheme === ColorTheme.NEUTRAL,
      'theme-strong': cardSettings?.colorTheme === ColorTheme.STRONG,
      'card--elevate-small': cardSettings?.elevation === CardElevation.SMALL,
      'card--elevate-medium': cardSettings?.elevation === CardElevation.MEDIUM,
      'card--elevate-large': cardSettings?.elevation === CardElevation.LARGE,
    }"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { ColorTheme, CardElevation } from "~/lib/strapi/dto/enums";
import type { CardSettingsDto } from "~/lib/strapi/dto/components";

const props = defineProps<{
  cardSettings?: CardSettingsDto;
}>();
</script>

<style scoped>
.card {
  --card-pad: 0;
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  padding: var(--card-pad);
}

.card--elevate-small {
  box-shadow: 0 -1px 1px 0 rgb(0 0 0 / 0.05), 0 2px 3px 0 rgb(0 0 0 / 0.1);
}

.card--elevate-medium {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}

.card--elevate-large {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
</style>
