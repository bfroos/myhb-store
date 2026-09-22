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
import {
  APP_BOOKING_URL,
  useAppBookingDialog,
} from "~/composables/useAppBookingDialog";
import { useCalendlyTreatmentEvent } from "~/composables/useCalendlyTreatmentEvent";
import { SharedButtonAction } from "~/lib/strapi/dto/enums";
import type { BaseButtonProps } from "~/lib/ui/types";

const props = defineProps<{
  button?: SharedButtonDto | null;
  buttonProps?: BaseButtonProps;
  data?: any;
  /**
   * Knopf, der bewusst NICHT den Standort der Seite erbt (#78).
   *
   * Der Knopf in der Kopfzeile ist auf jeder Seite derselbe und meint „ich
   * moechte einen Termin", nicht „ich moechte hier einen Termin". Er oeffnet
   * deshalb weiter den Standortwaehler, auch auf einer Standortseite.
   */
  ohneSeitenStandort?: boolean;
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
const { trackBookingClick } = useGoogleAnalytics();
const { prewarmBookingWhenIdle } = useBookingPrewarm();
const { treatmentEventUrl } = useCalendlyTreatmentEvent();
const { seitenStandort } = useSeitenStandort();

/**
 * Der Standort, den dieser Knopf benutzt (#78).
 *
 * Eigene Buchungsdaten gewinnen immer. Fehlen sie, erbt der Knopf den Standort
 * der Seite — auf einer Standortseite ist das genau die Lounge, die der
 * Besucher schon ausgesucht hat. Gibt es weder noch, oeffnet der Knopf wie
 * bisher den Standortwaehler.
 */
const knopfStandort = computed(() => {
  const eigen = {
    calendlyUrl: props.data?.calendlyUrl || button.value?.data?.calendlyUrl,
    appBookingUrl: props.data?.appBookingUrl || button.value?.data?.appBookingUrl,
    locationSlug: props.data?.locationSlug || button.value?.data?.locationSlug,
  };
  if (eigen.calendlyUrl || eigen.appBookingUrl) return eigen;
  if (props.ohneSeitenStandort) return eigen;
  return seitenStandort.value ?? eigen;
});

/**
 * Die Buchungs-URL dieses Knopfes, aus beiden Quellen wie beim Klick.
 *
 * #148: Kommt der Knopf von einer Behandlungsseite (`treatmentType` gesetzt),
 * zeigt die Calendly-URL direkt auf den Behandlungstermin des Kontos statt auf
 * die Terminart-Auswahl. Vorwaermen und Dialog muessen dieselbe URL sehen,
 * deshalb passiert das hier und nicht erst beim Klick.
 */
const bookingUrl = computed(() =>
  treatmentEventUrl(
    knopfStandort.value.calendlyUrl,
    props.data?.treatmentType || button.value?.data?.treatmentType,
  ),
);

// #141: Calendly zeichnet im iFrame erst 10 bis ueber 40 Sekunden nach dem
// Klick — es sei denn, seine Dateien liegen schon im Cache. Genau das holt das
// Vorwaermen nach, waehrend die Seite gelesen wird. Es laeuft nur einmal je
// Seite; weitere Buchungsknoepfe zeigen auf dieselbe URL.
onMounted(() => {
  if (button.value?.method !== "action") return;
  if (button.value?.action !== SharedButtonAction.APPOINTMENT_BOOKING) return;
  prewarmBookingWhenIdle(bookingUrl.value);
});

const handleClick = () => {
  // New in-app booking iframe method (limited rollout, e.g. Neukundenrabatt page)
  if (button.value?.method === "app-booking") {
    // #128: Dieser Knopf oeffnet die App unabhaengig vom A/B-Bucket. Ohne
    // Kennzeichnung saehe ein Besucher aus dem Calendly-Arm in GA4 aus wie ein
    // Messfehler (`booking_type=app` bei `ab_variant=calendly`).
    trackBookingClick("app", { ab_bypass: true });
    openAppBookingDialog(button.value?.label, APP_BOOKING_URL, {
      abBypass: true,
    });
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
  const url = bookingUrl.value;
  const treatmentType =
    props.data?.treatmentType || button.value?.data?.treatmentType;
  // Deeplink #66: Behandlungs-Slug fuer `?treatment=` in der App-Buchungs-URL.
  const appTreatmentSlug =
    props.data?.appTreatmentSlug || button.value?.data?.appTreatmentSlug;
  // #97/#100: Zweiter Buchungsweg des Standorts. Liegt er vor und ist der
  // Standort freigegeben, entscheidet der A/B-Split beim Klick zwischen
  // Calendly und App — sonst bleibt es bei der Calendly-URL.
  const appBookingUrl = knopfStandort.value.appBookingUrl;
  const locationSlug = knopfStandort.value.locationSlug;
  openCalendlyDialog(url, treatmentType, appTreatmentSlug, {
    appBookingUrl,
    locationSlug,
  });
}

const openNewsletterSignUpDialog = () => {
  dialog.open(
    defineAsyncComponent(
      () => import("~/components/ui/organism/NewsletterSignUpDialog.vue"),
    ),
    {
      // Buchungsdaten (calendlyUrl/appBookingUrl/treatmentType) durchreichen,
      // damit der Dialog nach der Anmeldung den passenden Buchungs-Dialog
      // oeffnen kann. Beide Quellen wie in openCalendlyDialogForButton: ein in
      // Strapi gepflegter Rabatt-Button traegt seine Buchungsdaten unter
      // `button.data`, nur die fest verdrahteten unter `props.data`. Fiel das
      // weg, verlor der Weg `appBookingUrl` -- und der A/B-Split (#100) haette
      // dort still immer Calendly geliefert.
      data: { ...button.value?.data, ...props.data },
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
