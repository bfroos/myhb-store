<template>
  <div class="newsletterSubscriptionForm theme-strong">
    <div class="newsletterSubscriptionForm__benefits">
      <ul class="newsletterSubscriptionForm__benefits__list">
        <li>
          <IconRosetteDiscount size="32" stroke="1.25" />
          {{ $t("newsletter.marketingText.exlusiveOffers") }}
        </li>
        <li>
          <IconMoodSmileBeam size="32" stroke="1.25" />
          {{ $t("newsletter.marketingText.treatmentNews") }}
        </li>
        <li>
          <IconRosetteDiscountCheck size="32" stroke="1.25" />
          {{ $t("newsletter.marketingText.eventInvitations") }}
        </li>
      </ul>
    </div>
    <Message v-if="success" severity="success">
      {{ $t("newsletter.success") }}
    </Message>
    <form v-else @submit="submit" class="newsletterSubscriptionForm__form">
      <Message v-if="error" severity="error">
        {{ error }}
      </Message>
      <div class="newsletterSubscriptionForm__form__controls">
        <InputText
          v-model="email"
          type="email"
          autocomplete="email"
          :placeholder="$t('newsletter.emailPlaceholder')"
          required
        />
        <UiAtomBaseButton variant="secondary" :disabled="loading" type="submit">
          {{ $t("cta.subscribe") }}
        </UiAtomBaseButton>
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import {
  IconRosetteDiscount,
  IconMoodSmileBeam,
  IconRosetteDiscountCheck,
} from "@tabler/icons-vue";
const email = ref("chrs.heinrich+600@gmail.com");
const loading = ref(false);
const success = ref<string | null>(null);
const error = ref<string | null>(null);

async function submit(event: SubmitEvent) {
  event.preventDefault();

  const form = event.currentTarget as HTMLFormElement | null;
  if (form && !form.reportValidity()) {
    return;
  }

  error.value = null;
  success.value = null;
  loading.value = true;

  try {
    await $fetch("/api/mailchimp/subscribe", {
      method: "POST",
      body: { email: email.value },
    });
    email.value = "";
    success.value = "ok";
  } catch (e: any) {
    const code = e?.data?.errorCode ?? e?.statusMessage ?? "generic";
    const key = `newsletter.errors.${code}`;
    error.value = $te(key) ? $t(key) : $t("newsletter.errors.generic");
  } finally {
    loading.value = false;
  }
}
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

.newsletterSubscriptionForm__benefits__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.newsletterSubscriptionForm__benefits__list > li {
  display: flex;
  align-items: center;
  gap: var(--space-200);
}

.newsletterSubscriptionForm__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-400);
}

.newsletterSubscriptionForm__form__controls {
  display: flex;
  flex-direction: column;
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
  .newsletterSubscriptionForm__form__controls {
    flex-direction: row;
  }
  .newsletterSubscriptionForm__form__controls > input {
    max-width: 40ch;
  }
}
</style>
