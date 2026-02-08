<template>
  <UiAtomBaseButton
    :as="as"
    :variant="button.variant"
    :href="href"
    :to="to"
    :target="target"
    :rel="rel"
    @click="handleClick"
    v-bind="buttonProps"
  >
    {{ button.label }}
  </UiAtomBaseButton>
</template>
<script setup lang="ts">
import { defineAsyncComponent } from "vue";
import { useDialog } from "primevue/usedialog";
import type { SharedButtonDto } from "~/lib/strapi/dto/components";
import { useCalendlyDialog } from "~/composables/useCalendlyDialog";
import { SharedButtonAction } from "~/lib/strapi/dto/enums";
import type { BaseButtonProps } from "~/lib/ui/types";

const props = defineProps<{
  button: SharedButtonDto;
  buttonProps?: BaseButtonProps;
  data?: any;
}>();

const { t } = useI18n();

const as = computed(() => {
  switch (props.button.method) {
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
  if (props.button.anchor) {
    const hash = props.button.anchor.startsWith("#")
      ? props.button.anchor
      : `#${props.button.anchor}`;
    return `${url}${hash}`;
  }
  return url;
};

const href = computed(() => {
  if (props.button.method !== "external-link") return undefined;
  return appendAnchor(props.button.url);
});

const target = computed(() => {
  if (props.button.method !== "external-link") return undefined;
  return props.button.openInNewWindow ? "_blank" : undefined;
});

const rel = computed(() => {
  if (props.button.method !== "external-link") return undefined;
  const parts: string[] = [];
  if (props.button.noFollow) parts.push("nofollow");
  if (props.button.openInNewWindow) parts.push("noopener");
  return parts.length > 0 ? parts.join(" ") : undefined;
});

const to = computed(() => {
  if (
    props.button.method === "external-link" ||
    props.button.method === "action"
  ) {
    return undefined;
  }

  if (props.button.method === "internal-link") {
    const path = resolveInternalToFromSharedButton(props.button);
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

const handleClick = () => {
  if (props.button.method !== "action" || !props.button.action) return;

  if (props.button.action === SharedButtonAction.APPOINTMENT_BOOKING) {
    openCalendlyDialogForButton();
  }
  if (props.button.action === SharedButtonAction.NEWSLETTER_SIGN_UP) {
    openNewsletterSignUpDialog();
  }
};

function openCalendlyDialogForButton() {
  const url =
    props.data?.calendlyUrl || props.button?.data?.calendlyUrl;
  openCalendlyDialog(url);
}

const openNewsletterSignUpDialog = () => {
  dialog.open(
    defineAsyncComponent(
      () => import("~/components/ui/organism/NewsletterSignUpDialog.vue"),
    ),
    {
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
