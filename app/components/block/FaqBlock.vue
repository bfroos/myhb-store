<template>
  <UiLayoutSectionBlock v-if="hasContent">
    <UiLayoutCardSurface :card-settings="cardSettings">
      <div class="faq">
        <header v-if="headline" class="faq__header">
          <h2 class="faq__heading">{{ headline }}</h2>
        </header>
        <div v-if="hasItems" class="faq__list" role="list">
          <UiMoleculeCollabsibleItem
            v-for="faq in allFaqs"
            :key="faq.id"
            :id="faq.id"
            :title="faq.question"
            :content="faq.answer"
          />
        </div>
      </div>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockFaqBlockDto } from "~/lib/strapi/dto/components";
import type { FaqDto } from "~/lib/strapi/dto/collections";

const props = defineProps<BlockFaqBlockDto>();

const hasContent = computed(
  () =>
    (!!props.headline && (props.faqs?.length ?? 0) > 0) ||
    (props.faqSets?.length ?? 0) > 0,
);

const hasItems = computed(
  () => (props.faqs?.length ?? 0) > 0 || (props.faqSets?.length ?? 0) > 0,
);

const allFaqs = computed((): FaqDto[] => {
  const idsInFaqSets = new Set<number | string>();
  props.faqSets?.forEach((set) => {
    set.faqs?.forEach((faq) => idsInFaqSets.add(faq.id));
  });

  const items: FaqDto[] = [];
  props.faqSets?.forEach((set) => {
    if (set.faqs) items.push(...set.faqs);
  });
  props.faqs?.forEach((faq) => {
    if (!idsInFaqSets.has(faq.id)) items.push(faq);
  });
  return items;
});
</script>

<style scoped>
.faq {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.faq__header {
  padding: var(--space-card-pad);
  border-bottom: 1px solid var(--color-border-mute);
  color: var(--color-text);
}

.faq__heading {
  margin: 0;
}

.faq__list {
  padding: calc(var(--space-card-pad) - var(--space-500)) var(--space-card-pad);
}

@media (min-width: 900px) {
  .faq {
    flex-direction: row;
  }

  .faq__header {
    flex: 0 0 30%;
    min-width: 20ch;
    border-bottom: none;
    border-right: 1px solid var(--color-border-mute);
    border-radius: var(--border-radius-card) 0 0 var(--border-radius-card);
  }

  .faq__list {
    flex: 1;
    padding: var(--space-card-pad);
  }
}
</style>
