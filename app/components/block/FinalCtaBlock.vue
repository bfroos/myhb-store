<template>
  <section
    v-if="hasContent"
    class="block final"
    :class="[themeClass, { 'block--elevated': elevated }]"
  >
    <h2 v-if="headline" class="final__heading">{{ headline }}</h2>
    <p v-if="text" class="final__text">{{ text }}</p>
    <UiMoleculeButtonGroup v-if="primaryCta || secondaryCta" class="final__cta">
      <SharedButton
        v-if="primaryCta"
        :button="primaryCta"
        :button-props="{ size: 'lg', fullWidth: true }"
        @click="trackCtaClick('footer')"
      />
      <SharedButton
        v-if="secondaryCta"
        :button="secondaryCta"
        :button-props="{ size: 'lg', fullWidth: true }"
        @click="trackCtaClick('footer_secondary')"
      />
    </UiMoleculeButtonGroup>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { SharedButtonDto } from "~/lib/strapi/dto/components";

const props = withDefaults(defineProps<{
  headline?: string;
  text?: string;
  primaryCta?: SharedButtonDto | null;
  secondaryCta?: SharedButtonDto | null;
  elevated?: boolean;
  themeClass?: "theme-light" | "theme-soft" | "theme-neutral" | "theme-strong";
}>(), {
  elevated: true,
  themeClass: "theme-light",
});

const hasContent = computed(
  () => !!props.headline || !!props.text || !!props.primaryCta || !!props.secondaryCta,
);

const { trackCtaClick } = useGoogleAnalytics();
</script>

<style scoped>
.block {
  background: var(--card-color-bg);
  color: var(--color-text);
  border-radius: var(--border-radius-card);
  padding: var(--space-card-pad);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-500);
}
.block--elevated { box-shadow: var(--shadow-1); }
.final__heading {
  margin: 0;
  font-size: var(--font-3xl);
  line-height: var(--line-3xl);
  font-weight: var(--font-bold);
  max-width: 22ch;
  letter-spacing: -0.01em;
}
.final__text {
  margin: 0;
  color: var(--color-text-light);
  font-size: var(--font-md);
  line-height: var(--line-md);
  max-width: 40ch;
}
.final__cta {
  width: 100%;
}
@media (min-width: 900px) {
  .block { padding: var(--space-800) var(--space-card-pad); }
  .final__heading { font-size: var(--font-5xl); line-height: var(--line-5xl); max-width: 28ch; }
  .final__cta { width: auto; }
}
</style>
