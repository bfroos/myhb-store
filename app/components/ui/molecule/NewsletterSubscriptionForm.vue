<template>
  <div class="newsletterSubscriptionForm theme-strong">
    <div class="newsletterSubscriptionForm__benefits">
      <span>Erhalte:</span>
      <ul>
        <li>
          <IconRosetteDiscount :size="18" stroke="1.25" /> Exklusive Angebote
        </li>
        <li>
          <IconMoodSmileBeam :size="18" stroke="1.25" /> News zu Behandlungen
        </li>
        <li>
          <IconRosetteDiscountCheck :size="18" stroke="1.25" /> Einladungen zu
          Events
        </li>
      </ul>
    </div>
    <form class="newsletterSubscriptionForm__form">
      <InputText
        v-model="email"
        type="email"
        placeholder="ihre@email.de"
        class="newsletterSubscriptionForm__input"
        autocomplete="email"
      />
      <UiAtomBaseButton variant="secondary" size="sm">
        {{ $t("cta.subscribe") }}
      </UiAtomBaseButton>
    </form>
  </div>
</template>
<script setup lang="ts">
import {
  IconRosetteDiscount,
  IconMoodSmileBeam,
  IconRosetteDiscountCheck,
} from "@tabler/icons-vue";
const email = ref("");
</script>
<style scoped>
.newsletterSubscriptionForm {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.newsletterSubscriptionForm > ul,
.newsletterSubscriptionForm > span {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  color: var(--color-text-light);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.newsletterSubscriptionForm__benefits {
  margin: 0 0 var(--space-400);
}

.newsletterSubscriptionForm__benefits > ul > li {
  display: flex;
  align-items: center;
  gap: var(--space-200);
}

.newsletterSubscriptionForm__form {
  display: flex;
  gap: var(--space-400);
}

@media screen and (min-width: 900px) {
  .newsletterSubscriptionForm__benefits,
  .newsletterSubscriptionForm__benefits > ul {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-400);
  }
}
</style>
