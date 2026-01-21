<template>
  <UiLayoutCardSurface>
    <article class="blogArticleTeaser">
      <NuxtLinkLocale :to="`/blog/${slug}`" class="blogArticleTeaser__link">
        <div class="blogArticleTeaser__image">
          <div class="blogArticleTeaser__image__inner">
            <UiAtomMediaPicture
              v-if="cover && isMediaImage(cover)"
              :media="cover"
              :sources="{
                [ImageBreakpoint.MEDIUM]: ImageFormat.MEDIUM,
              }"
            />
            <IconArticle v-else size="50%" stroke="1" />
          </div>
        </div>
        <div class="blogArticleTeaser__content">
          <p>
            <template v-if="category"> {{ category.name }} · </template>
            {{ displayDate }}
          </p>
          <h2 class="blogArticleTeaser__headline">{{ headline }}</h2>
          <p v-if="intro" class="blogArticleTeaser__intro">{{ intro }}</p>
        </div>
      </NuxtLinkLocale>
    </article>
  </UiLayoutCardSurface>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { IconArticle } from "@tabler/icons-vue";
import { ImageFormat, ImageBreakpoint } from "~/lib/strapi/dto/enums";
import type { MoleculeBlogArticleTeaser } from "~/lib/ui/types";

const props = defineProps<MoleculeBlogArticleTeaser>();
const { locale, locales } = useI18n();

const displayDate = computed(() => {
  if (!props.displayDate) return "";

  const dateObj =
    typeof props.displayDate === "string"
      ? new Date(props.displayDate)
      : props.displayDate;
  if (dateObj && isNaN(dateObj.getTime())) return "";

  const currentLocaleObj = locales.value.find(
    (l: any) => l.code === locale.value
  );
  const localeIso = String(currentLocaleObj?.iso || "de-DE");

  return dateObj.toLocaleDateString(localeIso, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
});
</script>

<style scoped>
.blogArticleTeaser {
  height: 100%;
}

.blogArticleTeaser__link {
  background: var(--color-card-bg-light);
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
  border-radius: var(--border-radius-card);
  overflow: hidden;
}

.blogArticleTeaser__image {
  padding: var(--space-card-figure-pad);
}

.blogArticleTeaser__image__inner {
  position: relative;
  aspect-ratio: 16 / 9;
  background: var(--color-gray-300);
  color: var(--color-gray-500);
  border-radius: var(--border-radius-card-figure);
  overflow: hidden;
}

.blogArticleTeaser__image :deep(img) {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.blogArticleTeaser__image :deep(svg) {
  display: inline-block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 0;
}

.blogArticleTeaser__content {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
  padding: var(--space-card-pad-xs) var(--space-card-pad-sm)
    var(--space-card-pad-sm);
}

.blogArticleTeaser__content > p {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.blogArticleTeaser__date {
  align-self: flex-start;
}

.blogArticleTeaser__headline {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
  margin: 0;
}

.blogArticleTeaser__intro {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-muted);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.blogArticleTeaser__cta {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
}
</style>
