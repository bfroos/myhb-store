<template>
  <aside
    class="float"
    :class="[`float--${position}`, { 'float--dismissed': dismissed }]"
    :style="{ '--offset': `${offset}px` }"
  >
    <a :href="href" class="float__link" :aria-label="ariaLabel">
      <PromoSticker :src="displayStickerSrc" :size="size" :rotate="rotate" :aria-label="ariaLabel" />
    </a>
    <button
      v-if="dismissible"
      type="button"
      class="float__close"
      aria-label="Aktion schließen"
      @click="dismissed = true"
    >
      <IconX :size="14" stroke="2" />
    </button>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { IconX } from "@tabler/icons-vue";
import PromoSticker from "../ui/atom/PromoSticker.vue";
import type { StrapiMedia } from "~/lib/strapi/dto/types";
import { mediaUrl } from "~/utils/landingBlockMedia";

const props = withDefaults(defineProps<{
  href?: string;
  stickerSrc?: string;
  stickerMedia?: StrapiMedia;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  size?: "sm" | "md" | "lg" | "xl";
  rotate?: number;
  offset?: number;
  dismissible?: boolean;
  ariaLabel?: string;
}>(), {
  href: "/aktion",
  position: "bottom-right",
  size: "lg",
  rotate: -8,
  offset: 24,
  dismissible: true,
  ariaLabel: "20 % auf Deine erste Behandlung sichern",
});

const dismissed = ref(false);
const displayStickerSrc = computed(() => mediaUrl(props.stickerMedia) ?? props.stickerSrc);
</script>

<style scoped>
.float {
  position: fixed;
  z-index: 950;
  display: inline-flex;
  transition: opacity 0.2s linear, transform 0.2s ease;
}
.float--bottom-right { bottom: var(--offset); right: var(--offset); }
.float--bottom-left  { bottom: var(--offset); left:  var(--offset); }
.float--top-right    { top:    var(--offset); right: var(--offset); }
.float--top-left     { top:    var(--offset); left:  var(--offset); }
.float--dismissed { opacity: 0; transform: scale(0.6); pointer-events: none; }

.float__link {
  display: inline-flex;
  text-decoration: none;
  transition: transform 0.15s ease;
}
.float__link:hover { transform: scale(1.04) rotate(2deg); }
.float__link:active { transform: scale(0.96); }

.float__close {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 0;
  background: #0d0d0e;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  font-family: inherit;
}
.float__close:hover { background: #292a2c; }
</style>
