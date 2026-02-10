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
        v-for="(item, index) in displayItems"
        :key="item.id"
        class="breadcrumb__item"
      >
        <span class="breadcrumb__separator" aria-hidden="true">
          <IconChevronRight :size="16" />
        </span>

        <template v-if="item.isEllipsis">
          <span class="breadcrumb__ellipsis" aria-hidden="true">
            {{ item.title }}
          </span>
        </template>
        <NuxtLinkLocale
          v-else-if="item.to && index < displayItems.length - 1"
          :to="item.to"
          class="breadcrumb__link"
          :title="item.title"
        >
          {{ displayTitle(item) }}
        </NuxtLinkLocale>
        <span
          v-else
          aria-current="page"
          class="breadcrumb__item__current"
          :title="item.title"
        >
          {{ displayTitle(item) }}
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
      (i) => i && typeof i.title === "string" && i.title.trim().length > 0,
    )
    .map((item, index) => ({
      id: `${index}-${item.to ?? item.title}`,
      title: item.title,
      to: item.to,
      isEllipsis: false,
    }));
});

const isMobile = ref(false);
const MOBILE_MAX = 900;

function updateMobile() {
  if (import.meta.client) {
    isMobile.value = window.innerWidth < MOBILE_MAX;
  }
}

onMounted(() => {
  updateMobile();
  window.addEventListener("resize", updateMobile);
});

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener("resize", updateMobile);
  }
});

type DisplayItem = {
  id: string;
  title: string;
  to?: string;
  isEllipsis: boolean;
};

const MOBILE_TITLE_MAX_LEN = 10;

function displayTitle(item: DisplayItem): string {
  if (item.isEllipsis) return item.title;
  const onlyOneLevel = normalizedItems.value.length === 1;
  if (
    onlyOneLevel ||
    !isMobile.value ||
    item.title.length <= MOBILE_TITLE_MAX_LEN
  ) {
    return item.title;
  }
  return item.title.slice(0, MOBILE_TITLE_MAX_LEN) + "…";
}

const displayItems = computed<DisplayItem[]>(() => {
  const items = normalizedItems.value;
  if (!isMobile.value) return items;
  if (items.length === 0) return items;
  if (items.length <= 2) return items;
  const ellipsis: DisplayItem = {
    id: "ellipsis",
    title: "…",
    to: undefined,
    isEllipsis: true,
  };
  const lastTwo = items.slice(-2);
  return [ellipsis, ...lastTwo];
});
</script>
<style scoped>
.breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-200);
  padding: 0 var(--container-pad);
  margin: var(--space-400) 0 calc(var(--space-400) * -1);
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

.breadcrumb__ellipsis {
  padding: 0 var(--space-100);
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
