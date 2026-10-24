<template>
  <!--
    E24 #346: lokale Ergaenzung unter einer bestehenden Strapi-Stadtseite
    (shared/seoCityExtras.ts). Eigener Text, naechster freier Termin live,
    Standortfakten und lokale Fragen - nur fuer diesen Standort.
  -->
  <UiLayoutSectionBlock spacing="sibling">
    <div class="seo-card" data-track-placement="seo_local_extra">
      <h2 class="seo-h2">{{ extra.headline }}</h2>
      <PagesTreatmentSeoText v-for="(p, i) in extra.intro" :key="i" :parts="p" :class="{ 'seo-lead': i === 0 }" />
      <div class="seo-hero__actions">
        <SharedButton :button="bookingButton" :data="bookingData" :button-props="{ size: 'lg', variant: 'primary' }" />
      </div>
      <p v-if="nextSlot.label.value" class="seo-hero__meta" data-track-placement="seo_next_slot">
        <span><span class="seo-dot" aria-hidden="true" />Nächster freier Termin: <strong>{{ nextSlot.label.value }}</strong></span>
      </p>
    </div>
  </UiLayoutSectionBlock>

  <UiLayoutSectionBlock v-if="facts" spacing="sibling">
    <div class="seo-card seo-card--soft" data-track-placement="seo_local_facts">
      <h2 class="seo-h2">{{ extra.factsHeadline }}</h2>
      <h3 class="seo-h3">Parken</h3>
      <ul class="seo-list">
        <li v-for="s in facts.parking" :key="s">{{ s }}</li>
      </ul>
      <h3 class="seo-h3">Barrierefreiheit</h3>
      <p>{{ facts.accessibility }}</p>
      <h3 class="seo-h3">Aus diesen Stadtteilen und Orten kommen Kundinnen zu uns</h3>
      <p>{{ facts.serviceAreaText }}</p>
      <ul class="seo-places" role="list">
        <li v-for="p in facts.serviceArea" :key="p">{{ p }}</li>
      </ul>
      <p class="seo-muted">{{ facts.factsSource }}</p>
    </div>
  </UiLayoutSectionBlock>

  <UiLayoutSectionBlock spacing="sibling">
    <div class="seo-card" data-track-placement="seo_local_faq">
      <h2 class="seo-h2">{{ extra.faqHeadline }}</h2>
      <PagesTreatmentSeoFaq :faqs="extra.faqs" />
    </div>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import type { BlockTreatmentHeroDto } from "~/lib/strapi/dto/components";
import type { LocationDto } from "~/lib/strapi/dto/collections";
import { SharedButtonAction, SharedButtonMethod } from "~/lib/strapi/dto/enums";
import { cityFactsBase, type SeoCityExtra } from "#shared/seoCityExtras";
import { applyLocalFacts } from "#shared/localFacts";

const props = defineProps<{
  extra: SeoCityExtra;
  hero?: BlockTreatmentHeroDto | null;
  location?: LocationDto | null;
}>();

// Standortfakten: Strapi-localFacts gewinnen, sonst Code (wie Stadtseite).
const facts = computed(() => {
  const base = cityFactsBase(props.extra.citySlug, props.extra.locationSlug);
  return base ? applyLocalFacts(base, props.location?.localFacts) : null;
});

const bookingButton = {
  label: "Termin wählen",
  method: SharedButtonMethod.ACTION,
  action: SharedButtonAction.APPOINTMENT_BOOKING,
};
const bookingData = computed(() => ({
  calendlyUrl: props.hero?.calendlyUrl,
  appBookingUrl: props.hero?.appBookingUrl ?? (props.location as any)?.appBookingUrl,
  locationSlug: props.hero?.locationSlug ?? props.extra.locationSlug,
  appTreatmentSlug: props.hero?.appTreatmentSlug,
  treatmentType: (props.hero as any)?.treatment?.type,
}));

const nextSlot = useNextSlot(
  () => bookingData.value.appBookingUrl,
  () => props.hero?.appTreatmentSlug || props.extra.pathKey.split("/").pop() || "",
);
</script>

<style src="./seo.css"></style>
