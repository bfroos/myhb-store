<template>
  <div class="shareButtons" :class="{ shareButtons_vertical: vertical }">
    <UiAtomBaseButton
      icon-only
      variant="tertiary"
      @click="copyLinkToClipboard"
      v-tooltip.right="copyTooltip"
      :aria-label="t(shareI18nKey + '.copy')"
    >
      <IconLink v-if="!copyTooltipSuccess" />
      <IconCheck v-else />
    </UiAtomBaseButton>
    <UiAtomBaseButton
      icon-only
      variant="tertiary"
      @click="shareOnWhatsApp"
      v-tooltip.right="{ value: t(shareI18nKey + '.whatsapp') }"
      :aria-label="t(shareI18nKey + '.whatsapp')"
    >
      <IconBrandWhatsapp />
    </UiAtomBaseButton>
    <UiAtomBaseButton
      icon-only
      variant="tertiary"
      @click="shareOnFacebook"
      v-tooltip.right="{ value: t(shareI18nKey + '.facebook') }"
      :aria-label="t(shareI18nKey + '.facebook')"
    >
      <IconBrandFacebook />
    </UiAtomBaseButton>
  </div>
</template>

<script setup lang="ts">
import {
  IconBrandFacebook,
  IconBrandWhatsapp,
  IconLink,
  IconCheck,
} from "@tabler/icons-vue";

const props = withDefaults(
  defineProps<{
    shareText?: string;
    shareI18nKey?: string;
    /** Vertikale Anordnung der Buttons */
    vertical?: boolean;
  }>(),
  {
    shareI18nKey: "common.share",
    vertical: false,
  },
);

const { t } = useI18n();

const copyTooltipSuccess = ref(false);
const copyTooltipLabel = computed(() =>
  copyTooltipSuccess.value
    ? t(props.shareI18nKey + ".copied")
    : t(props.shareI18nKey + ".copy"),
);
const copyTooltip = computed(() => ({
  value: copyTooltipLabel.value,
}));

async function copyLinkToClipboard() {
  const currentUrl = window.location.href;
  await navigator.clipboard.writeText(currentUrl);
  copyTooltipSuccess.value = true;
  setTimeout(() => {
    copyTooltipSuccess.value = false;
  }, 1500);
}

function shareOnWhatsApp() {
  const currentUrl = window.location.href;
  const shareText = props.shareText
    ? `${props.shareText} ${currentUrl}`
    : currentUrl;
  const encodedText = encodeURIComponent(shareText);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

function shareOnFacebook() {
  const currentUrl = window.location.href;
  const encodedUrl = encodeURIComponent(currentUrl);
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  window.open(facebookUrl, "_blank", "noopener,noreferrer");
}
</script>

<style scoped>
.shareButtons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-400);
}

.shareButtons_vertical {
  flex-direction: column;
}
</style>
