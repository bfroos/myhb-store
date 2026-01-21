<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="tableOfContentsBlock">
        <div class="tableOfContentsBlock__body">
          <div class="tableOfContentsBlock__header">
            <h2 v-if="headline">{{ headline }}</h2>
            <p v-if="intro" class="tableOfContentsBlock__intro">{{ intro }}</p>
            <div v-if="content" class="tableOfContentsBlock__content">
              <UiLayoutRichText v-if="content" :blocks="content ?? []" />
            </div>
          </div>
          <div
            v-if="links && links.length > 0"
            class="tableOfContentsBlock__cta"
          >
            <UiMoleculeButtonGroup>
              <SharedButton
                v-for="link in links"
                :key="link.id"
                :button="link"
              />
            </UiMoleculeButtonGroup>
            <UiMoleculeReviewsBadge
              show-text
              :source="ReviewSource.GOOGLE"
              :rating="5"
            />
          </div>
        </div>
        <div class="tableOfContentsBlock__summay">
          <h3>{{ $t("blocks.tableOfContents.content") }}</h3>
          <ol>
            <li v-for="item in contentsWithAnchorAndLabel" :key="item.anchor">
              <a :href="`#${item.anchor}`">{{ item.label }}</a>
            </li>
          </ol>
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockTableOfContentsDto } from "~/lib/strapi/dto/components";
import { ReviewSource } from "~/lib/strapi/dto/enums";
import type { SharedKeyValueDto } from "~/lib/strapi/dto/components";
import type { TableOfContentsItem } from "~/lib/ui/types";

const props = defineProps<BlockTableOfContentsDto>();

const contentsWithAnchorAndLabel = computed(() => {
  if (!props.index || props.index.length === 0) {
    return [];
  }

  return props.index.map((item: SharedKeyValueDto) => ({
    anchor: item.key,
    label: item.value,
  })) as TableOfContentsItem[];
});
</script>

<style scoped>
.tableOfContentsBlock__body {
  display: flex;
  flex-direction: column;
  align-items: space-between;
  gap: var(--space-600);
  padding: var(--space-card-pad);
}

.tableOfContentsBlock__body h2 {
  margin: 0 0 var(--space-600);
}

.tableOfContentsBlock__intro {
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  padding: 0 0 var(--space-600);
  margin: 0 0 var(--space-600);
  border-bottom: 1px solid var(--color-border-mute);
}

.tableOfContentsBlock__content {
  color: var(--color-text-light);
}

.tableOfContentsBlock__cta {
  display: flex;
  align-items: center;
  gap: var(--space-600);
}

.tableOfContentsBlock__summay {
  padding: var(--space-card-pad);
  border-top: 1px solid var(--color-border-mute);
}

.tableOfContentsBlock__summay ol {
  counter-reset: toc-item;
}

.tableOfContentsBlock__summay ol li {
  position: relative;
  margin: var(--space-200) 0;
  border-top: 1px solid var(--color-border-mute);
}

.tableOfContentsBlock__summay ol li a {
  display: block;
  padding: var(--space-400) 0 var(--space-400) var(--space-700);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.tableOfContentsBlock__summay ol li::before {
  content: counter(toc-item, decimal-leading-zero);
  counter-increment: toc-item;
  position: absolute;
  left: 0;
  top: var(--space-400);
  font-size: 1rem;
  color: var(--color-text-light);
}

@media screen and (min-width: 900px) {
  .tableOfContentsBlock {
    display: grid;
    grid-template-columns: 3fr 2fr;
  }
  .tableOfContentsBlock__summay {
    border-top: none;
    border-left: 1px solid var(--color-border-mute);
  }
}
</style>
