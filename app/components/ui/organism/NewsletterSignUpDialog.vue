<template>
  <div class="newsletterSignUpDialog">
    <h2>
      {{
        $t("newsletter.marketingText.headlineDiscount", {
          newsletterDiscountPercentage:
            globals.ecommerce.newsletterDiscountPercentage,
        })
      }}
    </h2>
    <ul class="newsletterSignUpDialog__benefits">
      <li>
        <IconRosetteDiscount size="28" stroke="1.25" />
        {{ $t("newsletter.marketingText.exlusiveOffers") }}
      </li>
      <li>
        <IconMoodSmileBeam size="28" stroke="1.25" />
        {{ $t("newsletter.marketingText.treatmentNews") }}
      </li>
      <li>
        <IconRosetteDiscountCheck size="28" stroke="1.25" />
        {{ $t("newsletter.marketingText.eventInvitations") }}
      </li>
    </ul>
    <template v-if="success">
      <Message severity="success">
        {{ $t("newsletter.success") }}
      </Message>
      <div class="newsletterSignUpDialog__actions">
        <UiAtomBaseButton :disabled="loading" @click="handleClose">
          {{ $t("cta.close") }}
        </UiAtomBaseButton>
      </div>
    </template>
    <form
      v-else
      class="newsletterSignUpDialog__form"
      @submit.prevent="handleSubmit"
    >
      <Message v-if="error" severity="error">
        {{ error }}
      </Message>
      <label
        for="newsletter-dialog-email"
        class="newsletterSignUpDialog__label"
      >
        {{ $t("newsletter.emailLabel") }}
      </label>
      <InputText
        id="newsletter-dialog-email"
        v-model="email"
        type="email"
        :placeholder="$t('newsletter.emailPlaceholder')"
        class="newsletterSignUpDialog__input"
        autocomplete="email"
        required
      />
      <div class="newsletterSignUpDialog__actions">
        <UiAtomBaseButton variant="secondary" @click="handleClose">
          {{ $t("cta.cancel") }}
        </UiAtomBaseButton>
        <UiAtomBaseButton :disabled="loading" type="submit">
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
import { inject } from "vue";
import InputText from "primevue/inputtext";

const globals = useGlobals();

const dialogRef = inject("dialogRef") as any;

const {
  email,
  loading,
  error,
  success,
  submit: submitNewsletter,
} = useNewsletterSignup();

const handleClose = () => {
  if (dialogRef) {
    dialogRef.value.close();
  }
};

async function handleSubmit() {
  await submitNewsletter();
}
</script>
<style scoped>
.newsletterSignUpDialog {
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
}

.newsletterSignUpDialog h2 {
  font-size: var(--font-md);
  line-height: var(--line-md);
  font-weight: var(--font-bold);
}

.newsletterSignUpDialog__form {
  display: flex;
  flex-direction: column;
  gap: var(--space-300);
}

.newsletterSignUpDialog__label {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text);
}

.newsletterSignUpDialog__input {
  width: 100%;
}

.newsletterSignUpDialog__benefits {
  display: flex;
  flex-direction: column;
  gap: var(--space-200);
  font-size: var(--font-sm);
  line-height: var(--line-sm);
}

.newsletterSignUpDialog__benefits > li {
  display: flex;
  align-items: center;
  gap: var(--space-200);
}

.newsletterSignUpDialog__actions {
  display: flex;
  gap: var(--space-300);
  justify-content: flex-end;
  margin-top: var(--space-400);
}
</style>
