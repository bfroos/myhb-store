<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="{ colorTheme: ColorTheme.STRONG }">
      <div class="blogPageHeader">
        <h1>{{ $t("blog.headline") }}</h1>
        <p>
          {{ $t("blog.intro") }}
        </p>
      </div>
      <nav class="blogPageHeader__nav">
        <ul class="blogPageHeader__navList">
          <li>
            <NuxtLinkLocale to="/blog" class="blogPageHeader__navLink">
              Alle
            </NuxtLinkLocale>
          </li>
          <li v-for="category in categories" :key="category.slug">
            <NuxtLinkLocale
              :to="`/blog/c/${category.slug}`"
              class="blogPageHeader__navLink"
            >
              {{ category.name }}
            </NuxtLinkLocale>
          </li>
        </ul>
      </nav>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import { ColorTheme } from "~/lib/strapi/dto/enums";
import type { BlogCategoryDto } from "~/lib/strapi/dto/collections";

defineProps<{
  headline?: string;
  categories?: BlogCategoryDto[];
}>();

const route = useRoute();
</script>
<style scoped>
.blogPageHeader {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-900);
  row-gap: var(--space-400);
  justify-content: space-between;
  align-items: center;
  padding: var(--space-card-pad);
}

.blogPageHeader > p {
  max-width: 40ch;
  color: var(--color-text-muted);
}

.blogPageHeader__navList {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-400);
  padding: var(--space-400) var(--space-card-pad) var(--space-400)
    calc(var(--space-card-pad) - var(--space-400));
  border-top: 1px solid var(--color-border-mute);
}

.blogPageHeader__navLink {
  display: inline-block;
  padding: var(--space-200) var(--space-400);
  text-decoration: none;
  border-radius: var(--border-radius-200);
  transition: background-color 0.2s ease;
}

.blogPageHeader__navLink.router-link-active {
  background-color: var(--card-color-bg-item-hover);
}

.blogPageHeader__navLink:hover {
  background-color: var(--card-color-bg-item-hover);
}
</style>
