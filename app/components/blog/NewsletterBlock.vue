<template>
  <div class="newsletterBlock">
    <h2>{{ formattedHeadline }}</h2>
    TODO: Newsletter Signup Formular
  </div>
</template>
<script setup lang="ts">
import type { SharedButtonDto } from "~/lib/strapi/dto/components";
import { replacePlaceholderString } from "~/utils/placeholder";

const props = defineProps<{
  button: SharedButtonDto;
  headline: string;
}>();

const globals = useGlobals();

const formattedHeadline = computed(() => {
  const discountPercentage =
    globals.value?.ecommerce?.newsletterDiscountPercentage ?? null;

  return (
    replacePlaceholderString(props.headline, [
      {
        placeholder: "{{ newsletterDiscountPercentage }}",
        replacement: discountPercentage
          ? String(discountPercentage) + "%"
          : $t("common.discount"),
      },
    ]) ?? props.headline
  );
});
</script>
<style scoped>
.newsletterBlock {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
  background-color: var(--color-card-bg-strong);
  color: var(--color-white);
  padding: var(--space-card-pad-sm);
  border-radius: var(--border-radius-200);
  margin: 2em 0;
}
.newsletterBlock h2 {
  font-size: var(--font-2xl);
  line-height: var(--line-2xl);
  font-weight: var(--font-bold);
  text-align: center;
  margin: 0 0 var(--space-400);
}

@media screen and (min-width: 1100px) {
  .newsletterBlock {
    margin: 2em calc(var(--space-card-pad) * -1);
  }
}
</style>
