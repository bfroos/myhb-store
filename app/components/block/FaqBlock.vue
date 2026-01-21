<template>
  <UiLayoutSectionBlock>
    <UiLayoutCardSurface :card-settings="cardSettings">
      <article class="faqBlock">
        <header v-if="headline" class="faqBlock__header">
          <h2>
            {{ headline }}
          </h2>
        </header>
        <div
          v-if="(faqs && faqs.length > 0) || (faqSets && faqSets.length > 0)"
          class="faqBlock__questions"
          role="list"
        >
          <UiMoleculeCollabsibleItem
            v-for="faq in faqs"
            :key="faq.id"
            :id="faq.id"
            :title="faq.question"
            :content="faq.answer"
          />
          <template v-for="faqSet in faqSets" :key="faqSet.id">
            <UiMoleculeCollabsibleItem
              v-for="faq in faqSet.faqs"
              :key="faqSet.id"
              :id="faq.id"
              :title="faq.question"
              :content="faq.answer"
            />
          </template>
        </div>
      </article>
    </UiLayoutCardSurface>
  </UiLayoutSectionBlock>
</template>
<script setup lang="ts">
import type { BlockFaqBlockDto } from "~/lib/strapi/dto/components";

const props = defineProps<BlockFaqBlockDto>();
</script>
<style scoped>
.faqBlock {
  display: flex;
  flex-direction: column;
}

.faqBlock__header {
  padding: var(--space-card-pad);
  border-color: var(--color-border-mute);
  border-style: solid;
  border-width: 0 0 1px 0;
  color: var(--color-text);
}

.faqBlock__body {
  flex: 1;
  padding: var(--space-card-pad-sm) var(--space-card-pad);
  border-bottom: 1px solid var(--color-border-mute);
}

.faqBlock__questions {
  padding: var(--space-card-pad);
}

.faqBlock__body:last-child {
  border-bottom: none;
}

@media screen and (min-width: 900px) {
  .faqBlock {
    flex-direction: row;
  }
  .faqBlock__header {
    flex: 0 0 30%;
    min-width: 20ch;
    border-width: 0 1px 0 0;
    border-radius: var(--border-radius-card) 0 0 var(--border-radius-card);
  }
}
</style>
