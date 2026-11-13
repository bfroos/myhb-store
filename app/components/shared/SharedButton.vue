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
import {
  useBookingDialog,
  type BookingDialogOptions,
} from "~/composables/useBookingDialog";
import { hasNewsletterSignup } from "~/composables/useNewsletterSignup";
import { NEUKUNDEN_OFFER } from "~/lib/checkoutAttempt";
import {
  APP_BOOKING_URL,
  useAppBookingDialog,
} from "~/composables/useAppBookingDialog";
import { SharedButtonAction } from "~/lib/strapi/dto/enums";
import type { BaseButtonProps } from "~/lib/ui/types";
import { KLINIK_CTA_LABEL, istAnfrageModal, modalBehandlung } from "#shared/klinik";

const props = defineProps<{
  button?: SharedButtonDto | null;
  buttonProps?: BaseButtonProps;
  data?: any;
  /**
   * Knopf, der bewusst weder Standort noch Behandlung der Seite erbt (#78).
   *
   * Der Knopf in der Kopfzeile ist auf jeder Seite derselbe und meint „ich
   * moechte einen Termin", nicht „ich moechte hier diesen Termin". Er oeffnet
   * deshalb weiter den Standortwaehler ohne Kontextzeile, auch auf einer
   * Standort- oder Behandlungsseite.
   */
  ohneSeitenKontext?: boolean;
}>();

const { t } = useI18n();
const globals = useGlobals();
const { isAdsMode } = useSiteModeFlags();
// Klinik-Regel (E28 #1636): Auf OP-Seiten wird jeder Buchungs- oder
// Rabatt-Knopf aus Strapi zum Anfrage-Knopf. Die Kopfzeile (ohneSeitenKontext)
// bleibt der allgemeine Termin-Knopf.
const klinikZiel = useKlinikSeite();
const istBuchungOderRabatt = (b: SharedButtonDto | null | undefined) =>
  !!b &&
  (b.method === "app-booking" ||
    (b.method === "action" &&
      (b.action === SharedButtonAction.APPOINTMENT_BOOKING ||
        b.action === SharedButtonAction.NEWSLETTER_SIGN_UP)));
// Benjamin 06.11.2026: Der Rabatt-Dialog (20-%-Code) nur fuer Besucher aus einer
// Meta-Anzeige (shared/rabattBerechtigt.ts). Fuer alle anderen wird aus jedem
// Rabatt-Knopf – auch aus Strapi-Inhalten und Blog – ein normaler Termin-Knopf.
const rabattBerechtigt = useRabattBerechtigt();
const button = computed<SharedButtonDto | null>(() => {
  if (
    props.button?.method === "action" &&
    props.button.action === SharedButtonAction.NEWSLETTER_SIGN_UP &&
    !rabattBerechtigt.value
  ) {
    return {
      ...props.button,
      label: t("cta.bookAppointment"),
      action: SharedButtonAction.APPOINTMENT_BOOKING,
    };
  }
  if (klinikZiel.value && !props.ohneSeitenKontext && istBuchungOderRabatt(props.button)) {
    return {
      label: KLINIK_CTA_LABEL,
      method: "external-link" as SharedButtonDto["method"],
      url: klinikZiel.value,
      variant: props.button?.variant,
    };
  }
  return props.button ?? null;
});

// OP-Seiten (seit 23.10.2026): Ziel "modal:<Behandlung>" oeffnet den Anfrage-Funnel als Modal.
const anfrageModal = computed(() =>
  istAnfrageModal(button.value?.url) ? (button.value!.url as string) : null,
);

const as = computed(() => {
  if (anfrageModal.value) return "button";
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
  if (anfrageModal.value || button.value?.method !== "external-link") return undefined;
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
        // go.: Blog ist aus (#199), /blog leitet auf /behandlungen weiter.
        return isAdsMode.value ? "/behandlungen" : "/blog";
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
const { openBookingDialog } = useBookingDialog();
const { openAppBookingDialog } = useAppBookingDialog();
const { trackBookingClick } = useGoogleAnalytics();
const { seitenStandort } = useSeitenStandort();
const { seitenBehandlung } = useSeitenBehandlung();

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
    appBookingUrl: props.data?.appBookingUrl || button.value?.data?.appBookingUrl,
    locationSlug: props.data?.locationSlug || button.value?.data?.locationSlug,
  };
  if (eigen.appBookingUrl) return eigen;
  if (props.ohneSeitenKontext) return eigen;
  return seitenStandort.value ?? eigen;
});

/**
 * Die Behandlung, die dieser Knopf in den Dialog traegt (#78).
 *
 * Eigene Daten gewinnen (Hero, schwebender CTA). Fehlen sie, erbt der Knopf
 * die Behandlung der Seite — auf einer Behandlungsseite gilt das fuer jeden
 * Knopf, nicht nur den ersten. `kontext` ist die Kontextzeile
 * „<Behandlung> · ab <Preis>" im Dialogkopf; sie kommt immer von der Seite.
 */
const knopfBehandlung = computed(() => {
  const eigen = {
    treatmentType: props.data?.treatmentType || button.value?.data?.treatmentType,
    appTreatmentSlug:
      props.data?.appTreatmentSlug || button.value?.data?.appTreatmentSlug,
  };
  if (props.ohneSeitenKontext) return { ...eigen, kontext: undefined };
  const seite = seitenBehandlung.value;
  return {
    treatmentType: eigen.treatmentType || seite?.treatmentType,
    appTreatmentSlug: eigen.appTreatmentSlug || seite?.appTreatmentSlug,
    kontext: seite?.kontext,
  };
});

const { openOpAnfrage } = useOpAnfrageDialog();

const handleClick = () => {
  if (anfrageModal.value) {
    openOpAnfrage(modalBehandlung(anfrageModal.value));
    return;
  }
  // New in-app booking iframe method (limited rollout, e.g. Neukundenrabatt page)
  if (button.value?.method === "app-booking") {
    // #128: Dieser Knopf oeffnet die App ohne Standort (Kennzeichnung
    // `ab_bypass` bleibt fuer die Auswertung).
    trackBookingClick("app", { ab_bypass: true });
    openAppBookingDialog(button.value?.label, APP_BOOKING_URL, {
      abBypass: true,
      abSource: isAdsMode.value ? "ads" : "seo",
    });
    return;
  }

  if (button.value?.method !== "action" || !button.value.action) return;

  if (button.value.action === SharedButtonAction.APPOINTMENT_BOOKING) {
    openBookingDialogForButton();
  }
  if (button.value.action === SharedButtonAction.NEWSLETTER_SIGN_UP) {
    // go. (02.10.2026): Schon angemeldet (Marke aus dem Rabatt-Dialog in
    // diesem Browser) -> kein zweites Formular, gleich die Buchung mit
    // Rabattkennung. Ohne Buchungsdaten bleibt es beim Formular.
    if (isAdsMode.value && hasNewsletterSignup() && hasBookingTarget()) {
      openBookingDialogForButton({ offer: NEUKUNDEN_OFFER });
      return;
    }
    openNewsletterSignUpDialog();
  }
};

function hasBookingTarget(): boolean {
  return !!(
    knopfStandort.value.appBookingUrl ||
    knopfBehandlung.value.treatmentType ||
    knopfBehandlung.value.appTreatmentSlug
  );
}

function openBookingDialogForButton(options?: BookingDialogOptions) {
  // #66/#78: Behandlungstyp, App-Slug (`?treatment=`) und Kontextzeile —
  // eigene Daten des Knopfes oder die Behandlung der Seite.
  const { treatmentType, appTreatmentSlug, kontext } = knopfBehandlung.value;
  // App-Buchungs-URL des Standorts; ohne sie oeffnet die Standortsuche.
  const appBookingUrl = knopfStandort.value.appBookingUrl;
  const locationSlug = knopfStandort.value.locationSlug;
  openBookingDialog(
    treatmentType,
    appTreatmentSlug,
    { appBookingUrl, locationSlug },
    kontext,
    options,
  );
}

const openNewsletterSignUpDialog = () => {
  dialog.open(
    defineAsyncComponent(
      () => import("~/components/ui/organism/NewsletterSignUpDialog.vue"),
    ),
    {
      // Buchungsdaten (appBookingUrl/treatmentType) durchreichen,
      // damit der Dialog nach der Anmeldung den passenden Buchungs-Dialog
      // oeffnen kann. Beide Quellen wie in openBookingDialogForButton: ein in
      // Strapi gepflegter Rabatt-Button traegt seine Buchungsdaten unter
      // `button.data`, nur die fest verdrahteten unter `props.data`. Fiel das
      // weg, verlor der Weg `appBookingUrl`.
      data: {
        ...button.value?.data,
        ...props.data,
        // 02.10.2026: Buchung nach dem Dialog = Buchung per Knopf, derselbe
        // Standort (#78, auch geerbt).
        appBookingUrl: knopfStandort.value.appBookingUrl,
        locationSlug: knopfStandort.value.locationSlug,
        // #78: Behandlung der Seite, falls der Knopf selbst keine traegt.
        treatmentType: knopfBehandlung.value.treatmentType,
        appTreatmentSlug: knopfBehandlung.value.appTreatmentSlug,
        treatmentContext: knopfBehandlung.value.kontext,
      },
      props: {
        modal: true,
        draggable: false,
        // Mit Buchungsziel ist der Dialog der Rabatt-Schritt vor der
        // Buchung, nicht die Newsletter-Anmeldung (07.10.2026).
        header: hasBookingTarget()
          ? t("dialogs.newsletterSignUp.headerDiscount", {
              newsletterDiscountPercentage:
                globals.value?.ecommerce?.newsletterDiscountPercentage ?? 20,
            })
          : t("dialogs.newsletterSignUp.header"),
        style: {
          // Die Ueberschrift "20 % Neukunden-Rabatt sichern" stiess bei 25rem
          // an das Schliessen-X (07.10.2026).
          width: hasBookingTarget() ? "28rem" : "25rem",
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
