<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <article class="toc">
        <div class="toc__body">
          <header class="toc__header">
            <h2 v-if="headline" class="toc__title">{{ headline }}</h2>
            <p v-if="intro" class="toc__intro">{{ intro }}</p>
            <div v-if="content" class="toc__content">
              <UiLayoutRichText :blocks="content ?? []" />
            </div>
          </header>
          <div v-if="hasLinks" class="toc__cta">
            <UiMoleculeButtonGroup>
              <SharedButton
                v-for="link in links"
                :key="link.id"
                :button="link"
              />
            </UiMoleculeButtonGroup>
            <UiMoleculeReviewsBadge :source="ReviewSource.GOOGLE" :rating="5" />
          </div>
        </div>
        <nav v-if="hasIndex" class="toc__nav" aria-labelledby="toc-heading">
          <h3 id="toc-heading" class="toc__nav-title">
            {{ $t("blocks.tableOfContents.content") }}
          </h3>
          <ol class="toc__list" role="list">
            <li
              v-for="item in contentsWithAnchorAndLabel"
              :key="item.anchor"
              class="toc__item"
            >
              <a :href="`#${item.anchor}`" class="toc__link">
                {{ item.label }}
              </a>
            </li>
          </ol>
        </nav>
      </article>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type {
  BlockTableOfContentsDto,
  SharedKeyValueDto,
} from "~/lib/strapi/dto/components";
import { ReviewSource } from "~/lib/strapi/dto/enums";
import type { TableOfContentsItem } from "~/lib/ui/types";

const props = defineProps<BlockTableOfContentsDto>();

const hasLinks = computed(() => (props.links?.length ?? 0) > 0);

const hasIndex = computed(() => (props.index?.length ?? 0) > 0);

const contentsWithAnchorAndLabel = computed(() => {
  if (!props.index?.length) return [];

  return props.index
    .filter((item: SharedKeyValueDto) => item.value?.trim())
    .map((item: SharedKeyValueDto) => ({
      anchor: item.key,
      label: item.value,
    })) as TableOfContentsItem[];
});
</script>

<style scoped>
.toc__body {
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
  padding: var(--space-card-pad);
}

.toc__title {
  margin: 0 0 var(--space-600);
}

.toc__intro {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  margin: 0 0 var(--space-600);
  padding-bottom: var(--space-600);
  border-bottom: 1px solid var(--color-border-mute);
}

.toc__content {
  color: var(--color-text-light);
}

.toc__cta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-600);
}

.toc__nav {
  padding: var(--space-card-pad);
  border-top: 1px solid var(--color-border-mute);
}

.toc__nav-title {
  margin: 0 0 var(--space-400);
}

.toc__list {
  counter-reset: toc-item;
  list-style: none;
  margin: 0;
  padding: 0;
}

.toc__item {
  position: relative;
  counter-increment: toc-item;
  margin-top: var(--space-200);
  margin-bottom: var(--space-200);
  border-top: 1px solid var(--color-border-mute);
}

.toc__item::before {
  content: counter(toc-item, decimal-leading-zero);
  position: absolute;
  left: 0;
  top: var(--space-400);
  font-size: 1rem;
  color: var(--color-text-light);
}

.toc__link {
  display: block;
  padding-top: var(--space-400);
  padding-bottom: var(--space-400);
  padding-left: var(--space-700);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  text-decoration: underline;
  color: inherit;
}

.toc__link:hover {
  text-decoration: none;
}

@media (min-width: 900px) {
  .toc {
    display: grid;
    grid-template-columns: 3fr 2fr;
  }

  .toc__body {
    grid-column: 1;
  }

  .toc__nav {
    grid-column: 2;
    border-top: none;
    border-left: 1px solid var(--color-border-mute);
  }
}
</style>
