<template>
  <div
    v-if="videoId"
    class="youTubeEmbed"
    :class="`youTubeEmbed--${aspectRatio ?? '16-9'}`"
  >
    <iframe
      v-if="isActivated"
      class="youTubeEmbed__frame"
      :src="embedSrc"
      :title="title ?? 'YouTube'"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen
    />

    <template v-else>
      <img
        v-if="previewSrc"
        class="youTubeEmbed__poster"
        :src="previewSrc"
        :alt="title ?? ''"
        loading="lazy"
        decoding="async"
      />

      <div v-if="!isReady && !didTimeout" class="youTubeEmbed__overlay">
        <UiLayoutIconWrapper :size="40" rotate>
          <IconLoader />
        </UiLayoutIconWrapper>
      </div>

      <div v-else-if="!hasMarketingConsent" class="youTubeEmbed__overlay">
        <UiLayoutIconWrapper :size="40">
          <IconBrandYoutube />
        </UiLayoutIconWrapper>
        <h3>{{ $t("youtube.consentRequired") }}</h3>
        <p>{{ $t("youtube.consentDescription") }}</p>
        <UiAtomBaseButton
          type="button"
          variant="link"
          size="sm"
          @click="openCookieSettings"
        >
          {{ $t("youtube.consentButton") }}
        </UiAtomBaseButton>
      </div>

      <button
        v-else
        type="button"
        class="youTubeEmbed__play"
        :aria-label="title ? `${$t('cta.watch')}: ${title}` : $t('cta.watch')"
        @click="isActivated = true"
      >
        <span class="youTubeEmbed__playIcon">
          <IconPlayerPlayFilled :size="28" />
        </span>
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  IconBrandYoutube,
  IconLoader,
  IconPlayerPlayFilled,
} from "@tabler/icons-vue";
import { ImageFormat } from "~/lib/strapi/dto/enums";
import type { BlockYoutubeVideoAspectRatio } from "~/lib/strapi/dto/enums";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { getMediaUrl } from "~/utils/media";
import { parseYouTubeUrl } from "~/utils/youtube";

const props = defineProps<{
  videoUrl?: string;
  poster?: StrapiMedia;
  title?: string;
  aspectRatio?: BlockYoutubeVideoAspectRatio;
}>();

const { hasMarketingConsent, openCookieSettings, isReady, didTimeout } =
  useCookiebot();

const isActivated = ref(false);

const parsed = computed(() => parseYouTubeUrl(props.videoUrl));
const videoId = computed(() => parsed.value?.id);

const embedSrc = computed(() => {
  if (!videoId.value) return "";
  const params = new URLSearchParams({
    autoplay: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (parsed.value?.start) params.set("start", String(parsed.value.start));
  return `https://www.youtube-nocookie.com/embed/${videoId.value}?${params.toString()}`;
});

// The CMS poster is served from our own CDN, so it may render before consent; the
// YouTube thumbnail is a Google request and waits for it.
const previewSrc = computed(() => {
  if (props.poster) return getMediaUrl(props.poster, ImageFormat.LARGE);
  if (!hasMarketingConsent.value || !videoId.value) return undefined;
  return `https://i.ytimg.com/vi/${videoId.value}/maxresdefault.jpg`;
});
</script>

<style scoped>
.youTubeEmbed {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: var(--radius-md, 8px);
  background-color: var(--color-gray-900);
}

.youTubeEmbed--16-9 {
  aspect-ratio: 16 / 9;
}

.youTubeEmbed--9-16 {
  aspect-ratio: 9 / 16;
  max-width: 420px;
  margin-inline: auto;
}

.youTubeEmbed--4-3 {
  aspect-ratio: 4 / 3;
}

.youTubeEmbed--1-1 {
  aspect-ratio: 1 / 1;
}

.youTubeEmbed__frame,
.youTubeEmbed__poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
}

.youTubeEmbed__poster {
  object-fit: cover;
}

.youTubeEmbed__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-400);
  padding: var(--space-600);
  text-align: center;
  color: var(--color-text-muted);
  background-color: rgba(0, 0, 0, 0.72);
}

.youTubeEmbed__overlay :deep(svg) {
  color: var(--color-text-muted);
}

.youTubeEmbed__overlay h3 {
  margin: 0;
  font-size: var(--font-lg);
  line-height: var(--line-lg);
  font-weight: var(--font-bold);
}

.youTubeEmbed__overlay p {
  margin: 0;
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  max-width: 60ch;
}

.youTubeEmbed__play {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  padding: 0;
  cursor: pointer;
  background: transparent;
}

.youTubeEmbed__playIcon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  color: var(--color-white);
  background-color: rgba(0, 0, 0, 0.6);
  transition: transform 150ms ease, background-color 150ms ease;
}

.youTubeEmbed__play:hover .youTubeEmbed__playIcon,
.youTubeEmbed__play:focus-visible .youTubeEmbed__playIcon {
  transform: scale(1.08);
  background-color: rgba(0, 0, 0, 0.8);
}
</style>
