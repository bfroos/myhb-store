<template>
  <nav
    v-if="normalizedItems.length > 0"
    class="breadcrumb"
    aria-label="Breadcrumb"
  >
    <NuxtLinkLocale to="/" class="breadcrumb__home" aria-label="Zur Startseite">
      <IconHome :size="16" aria-hidden="true" />
    </NuxtLinkLocale>
    <ol class="breadcrumb__list">
      <li
        v-for="(item, index) in normalizedItems"
        :key="item.id"
        class="breadcrumb__item"
      >
        <span class="breadcrumb__separator" aria-hidden="true">
          <IconChevronRight :size="16" />
        </span>

        <NuxtLinkLocale
          v-if="item.to && index < normalizedItems.length - 1"
          :to="item.to"
          class="breadcrumb__link"
        >
          {{ item.title }}
        </NuxtLinkLocale>

        <span v-else aria-current="page" class="breadcrumb__item__current">
          {{ item.title }}
        </span>
      </li>
    </ol>
  </nav>
</template>
<script setup lang="ts">
import { IconHome, IconChevronRight } from "@tabler/icons-vue";
import type { BreadcrumbItem } from "~/lib/ui/types";

const props = defineProps<{
  items?: BreadcrumbItem[];
}>();

const normalizedItems = computed(() => {
  return (props.items ?? [])
    .filter(
      (i) => i && typeof i.title === "string" && i.title.trim().length > 0
    )
    .map((item, index) => ({
      id: `${index}-${item.to ?? item.title}`,
      title: item.title,
      to: item.to,
    }));
});
</script>
<style scoped>
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-200);
  padding: 0 var(--container-pad);
  margin: var(--space-400) 0;
  color: var(--color-text-light);
}

.breadcrumb__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-100);
  margin: 0;
  padding: 0;
}

.breadcrumb__item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-100);
  list-style: none;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.breadcrumb__home,
.breadcrumb__item > * {
  display: inline-flex;
  align-items: center;
  height: 100%;
}

.breadcrumb__separator {
  color: var(--color-text-muted);
}

.breadcrumb__link,
.breadcrumb .breadcrumb__item__current {
  display: inline-block;
  padding: 0 var(--space-100);
  color: var(--color-text-light);
  text-decoration: none;
}

.breadcrumb__link:hover {
  color: var(--color-text);
}
</style>
