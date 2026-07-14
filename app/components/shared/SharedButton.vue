<template>
  <UiAtomBaseButton
    v-if="button"
    :as="as"
    :variant="button?.variant"
    :href="href"
    :to="to"
    :target="target"
    :rel="rel"
    @click="handleClick"
    v-bind="buttonProps"
  >
    {{ button?.label }}
  </UiAtomBaseButton>
</template>
<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";
import type { SharedButtonDto } from "~/lib/strapi/dto/components";
import { useCalendlyDialog } from "~/composables/useCalendlyDialog";
import { useAppBookingDialog } from "~/composables/useAppBookingDialog";
import { SharedButtonAction } from "~/lib/strapi/dto/enums";
import type { BaseButtonProps } from "~/lib/ui/types";

const props = defineProps<{
  button?: SharedButtonDto | null;
  buttonProps?: BaseButtonProps;
  data?: any;
}>();

const { t } = useI18n();
const button = computed(() => props.button ?? null);

const as = computed(() => {
  switch (button.value?.method) {
    case "external-link":
      return "a";
    case "internal-link":
      return "nuxt-link-locale";
    default:
      return "button";
  }
});

/**
 * Appends an anchor hash to a URL/path if provided.
 */
const appendAnchor = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  if (button.value?.anchor) {
    const hash = button.value.anchor.startsWith("#")
      ? button.value.anchor
      : `#${button.value.anchor}`;
    return `${url}${hash}`;
  }
  return url;
};

const href = computed(() => {
  if (button.value?.method !== "external-link") return undefined;
  return appendAnchor(button.value.url);
});

const target = computed(() => {
  if (button.value?.method !== "external-link") return undefined;
  return button.value.openInNewWindow ? "_blank" : undefined;
});

const rel = computed(() => {
  if (button.value?.method !== "external-link") return undefined;
  const parts: string[] = [];
  if (button.value.noFollow) parts.push("nofollow");
  if (button.value.openInNewWindow) parts.push("noopener");
  return parts.length > 0 ? parts.join(" ") : undefined;
});

const to = computed(() => {
  if (
    button.value?.method === "external-link" ||
    button.value?.method === "action" ||
    button.value?.method === "app-booking"
  ) {
    return undefined;
  }

  if (button.value?.method === "internal-link") {
    const path = resolveInternalToFromSharedButton(button.value);
    return appendAnchor(path);
  }
});

function resolveInternalToFromSharedButton(
  button: SharedButtonDto,
): string | undefined {
  if (button.targetType === "single-type") {
    switch (button.singleType) {
      case "homepage":
        return "/";
      case "about-us":
        return "/ueber-uns";
      case "blog":
        return "/blog";
      case "career":
        return "/karriere";
      case "doctors":
        return "/aerzte";
      case "prices":
        return "/preise";
      case "locations":
        return "/standorte";
    }
  }

  switch (button.collection) {
    case "page": {
      const slug = button.page?.slug;
      if (!slug) return "/";
      return `/p/${slug}`;
    }
    case "treatment": {
      const slug = button.treatment?.pathKey;
      if (!slug) return "/";
      return `/behandlungen/${slug}`;
    }
    case "location": {
      const citySlug = button.location?.city?.slug;
      const slug = button.location?.slug;
      if (!slug) return "/";
      return `/standorte/${citySlug}/${slug}`;
    }
    case "product": {
      const categorySlug = button.product?.category?.slug;
      const slug = button.product?.slug;
      if (!slug) return "/";
      return `/produkte/${categorySlug}/${slug}`;
    }
  }
}

const dialog = useDialog();
const { openCalendlyDialog } = useCalendlyDialog();
const { openAppBookingDialog } = useAppBookingDialog();

const handleClick = () => {
  // New in-app booking iframe method (limited rollout, e.g. Neukundenrabatt page)
  if (button.value?.method === "app-booking") {
    openAppBookingDialog(button.value?.label);
    return;
  }

  if (button.value?.method !== "action" || !button.value.action) return;

  if (button.value.action === SharedButtonAction.APPOINTMENT_BOOKING) {
    openCalendlyDialogForButton();
  }
  if (button.value.action === SharedButtonAction.NEWSLETTER_SIGN_UP) {
    openNewsletterSignUpDialog();
  }
};

function openCalendlyDialogForButton() {
  const url = props.data?.calendlyUrl || button.value?.data?.calendlyUrl;
  const treatmentType =
    props.data?.treatmentType || button.value?.data?.treatmentType;
  openCalendlyDialog(url, treatmentType);
}

const openNewsletterSignUpDialog = () => {
  dialog.open(
    defineAsyncComponent(
      () => import("~/components/ui/organism/NewsletterSignUpDialog.vue"),
    ),
    {
      // Buchungsdaten (calendlyUrl/treatmentType) durchreichen, damit der
      // Dialog nach der Anmeldung den passenden Buchungs-Dialog oeffnen kann.
      data: props.data,
      props: {
        modal: true,
        draggable: false,
        header: t("dialogs.newsletterSignUp.header"),
        style: {
          width: "25rem",
        },
        breakpoints: {
          "960px": "75vw",
          "640px": "90vw",
        },
      },
    },
  );
};
</script>
