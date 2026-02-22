<template>
  <div class="horizontalScroll">
    <div
      ref="scrollContainer"
      class="horizontalScroll__container"
      @scroll.passive="onScroll"
    >
      <slot />
    </div>
    <div
      v-if="canScrollLeft || canScrollRight"
      class="horizontalScroll__controls"
    >
      <UiAtomBaseButton
        icon-only
        variant="tertiary"
        :class="{ 'horizontalScroll__button--hidden': !canScrollLeft }"
        :aria-label="'Vorheriges Element'"
        :disabled="!canScrollLeft"
        @click="scrollToPrevious"
      >
        <IconArrowLeft size="24" aria-hidden="true" />
      </UiAtomBaseButton>
      <div v-if="scrollbarThumbWidth < 100" class="horizontalScroll__scrollbar">
        <div
          class="horizontalScroll__scrollbarTrack"
          ref="scrollbarTrack"
          role="scrollbar"
          :aria-label="'Scrollbar'"
          :aria-valuemin="0"
          :aria-valuemax="100"
          :aria-valuenow="scrollbarThumbLeft"
          tabindex="0"
          @click="handleScrollbarClick"
          @keydown="handleScrollbarKeydown"
        >
          <div
            class="horizontalScroll__scrollbarThumb"
            :style="{
              width: scrollbarThumbWidth + '%',
              left: scrollbarThumbLeft + '%',
            }"
          ></div>
        </div>
      </div>
      <UiAtomBaseButton
        icon-only
        variant="tertiary"
        :class="{ 'horizontalScroll__button--hidden': !canScrollRight }"
        :aria-label="'Nächstes Element'"
        :disabled="!canScrollRight"
        @click="scrollToNext"
      >
        <IconArrowRight size="24" aria-hidden="true" />
      </UiAtomBaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-vue";

const scrollContainer = ref<HTMLElement | null>(null);
const scrollbarTrack = ref<HTMLElement | null>(null);

const scrollbarThumbWidth = ref(0);
const scrollbarThumbLeft = ref(0);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

// Throttle layout reads/writes to at most once per animation frame.
let rafId: number | null = null;
let scheduled = false;
let resizeObserver: ResizeObserver | null = null;

function setIfChanged(target: { value: any }, next: any, eps = 0.0001) {
  const prev = target.value;
  if (typeof prev === "number" && typeof next === "number") {
    if (Math.abs(prev - next) < eps) return;
  } else {
    if (prev === next) return;
  }
  target.value = next;
}

const updateScrollbar = () => {
  const container = scrollContainer.value;
  if (!container) return;

  // --- READS (layout/scroll metrics)
  const scrollWidth = container.scrollWidth;
  const clientWidth = container.clientWidth;
  const scrollLeft = container.scrollLeft;
  const maxScrollLeft = scrollWidth - clientWidth;

  // --- CALC
  const nextThumbWidth =
    scrollWidth > clientWidth ? (clientWidth / scrollWidth) * 100 : 100;

  const nextThumbLeft =
    maxScrollLeft > 0
      ? (scrollLeft / maxScrollLeft) * (100 - nextThumbWidth)
      : 0;

  const nextCanLeft = scrollLeft > 0;
  const nextCanRight = scrollLeft < maxScrollLeft - 1; // -1 for rounding

  // --- WRITES (reactive state)
  setIfChanged(scrollbarThumbWidth, nextThumbWidth);
  setIfChanged(scrollbarThumbLeft, nextThumbLeft);
  setIfChanged(canScrollLeft, nextCanLeft);
  setIfChanged(canScrollRight, nextCanRight);
};

const scheduleUpdateScrollbar = () => {
  if (scheduled) return;
  scheduled = true;

  rafId = window.requestAnimationFrame(() => {
    scheduled = false;
    updateScrollbar();
  });
};

const onScroll = () => {
  scheduleUpdateScrollbar();
};

const scrollToNext = () => {
  const container = scrollContainer.value;
  if (!container) return;

  const children = Array.from(container.children) as HTMLElement[];
  if (children.length === 0) return;

  // Avoid getBoundingClientRect() in a loop (common forced reflow trigger).
  const scrollLeft = container.scrollLeft;
  const containerWidth = container.clientWidth;
  const visibleRight = scrollLeft + containerWidth;

  // Find the first element that is not fully visible to the right.
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!child) continue;

    const childLeft = child.offsetLeft;
    const childRight = childLeft + child.offsetWidth;

    if (childRight > visibleRight + 1) {
      // Keep scrollIntoView to respect scroll-padding.
      child.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
      break;
    }
  }
};

const scrollToPrevious = () => {
  const container = scrollContainer.value;
  if (!container) return;

  const children = Array.from(container.children) as HTMLElement[];
  if (children.length === 0) return;

  const scrollLeft = container.scrollLeft;

  // Find the last element that is not fully visible to the left.
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (!child) continue;

    const childLeft = child.offsetLeft;

    if (childLeft < scrollLeft - 1) {
      child.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
      break;
    }
  }
};

const handleScrollbarClick = (event: MouseEvent) => {
  const container = scrollContainer.value;
  const track = scrollbarTrack.value;
  if (!container || !track) return;

  // Single rect read per click is fine; avoid doing it in scroll loops.
  const trackRect = track.getBoundingClientRect();
  const clickX = event.clientX - trackRect.left;
  const clickPercent = clickX / trackRect.width;

  scrollToPosition(clickPercent);
};

const scrollToPosition = (percent: number) => {
  const container = scrollContainer.value;
  if (!container) return;

  const scrollWidth = container.scrollWidth;
  const clientWidth = container.clientWidth;
  const maxScrollLeft = scrollWidth - clientWidth;

  const targetScrollLeft = percent * maxScrollLeft;

  container.scrollTo({
    left: targetScrollLeft,
    behavior: "smooth",
  });
};

const handleScrollbarKeydown = (event: KeyboardEvent) => {
  const container = scrollContainer.value;
  if (!container) return;

  const scrollWidth = container.scrollWidth;
  const clientWidth = container.clientWidth;
  const maxScrollLeft = scrollWidth - clientWidth;
  const currentScrollLeft = container.scrollLeft;
  const scrollPercent =
    maxScrollLeft > 0 ? currentScrollLeft / maxScrollLeft : 0;
  const stepPercent = 0.1; // 10% per step

  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const newPercent = Math.max(
      0,
      Math.min(1, scrollPercent + direction * stepPercent),
    );
    scrollToPosition(newPercent);
  } else if (event.key === "Home") {
    event.preventDefault();
    scrollToPosition(0);
  } else if (event.key === "End") {
    event.preventDefault();
    scrollToPosition(1);
  } else if (event.key === "PageUp") {
    event.preventDefault();
    const newPercent = Math.max(0, scrollPercent - stepPercent * 2);
    scrollToPosition(newPercent);
  } else if (event.key === "PageDown") {
    event.preventDefault();
    const newPercent = Math.min(1, scrollPercent + stepPercent * 2);
    scrollToPosition(newPercent);
  }
};

const handleResize = () => {
  scheduleUpdateScrollbar();
};

onMounted(() => {
  scheduleUpdateScrollbar();
  window.addEventListener("resize", handleResize, { passive: true });

  if (scrollContainer.value) {
    resizeObserver = new ResizeObserver(() => {
      scheduleUpdateScrollbar();
    });
    resizeObserver.observe(scrollContainer.value);
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);

  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  if (rafId != null) {
    window.cancelAnimationFrame(rafId);
    rafId = null;
  }
});
</script>

<style scoped>
.horizontalScroll {
  --horizontalScroll-color-scrollbarTrack: var(--color-border-mute);
  --horizontalScroll-color-scrollbarTrack-hover: var(--color-border-light);
  --horizontalScroll-color-scrollbarThumb: var(--color-text);
  --horizontalScroll-color-scrollbarThumb-hover: var(--color-text);
  --horizontalScroll-padding-x: 0;
  --horizontalScroll-padding-y: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-500);
  padding: var(--horizontalScroll-padding-y) var(--horizontalScroll-padding-x);
}

.horizontalScroll__container {
  display: flex;
  gap: var(--space-500);
  overflow-x: auto;
  overflow-y: hidden;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  margin-left: calc(var(--horizontalScroll-padding-x) * -1);
  margin-right: calc(var(--horizontalScroll-padding-x) * -1);
  padding-left: var(--horizontalScroll-padding-x);
  padding-right: var(--horizontalScroll-padding-x);

  /* Verstecke Browser-Scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE und Edge */
}

.horizontalScroll__container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.horizontalScroll__container > * {
  scroll-snap-align: start;
  scroll-snap-stop: always;
  flex: 0 0 auto;
}

.horizontalScroll__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-500);
}

.horizontalScroll__button--hidden {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.horizontalScroll__scrollbar {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 var(--space-300);
}

.horizontalScroll__scrollbarTrack {
  position: relative;
  width: 100%;
  min-height: 32px;
  padding: 15px 0;
  background-color: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.horizontalScroll__scrollbarTrack::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  transform: translateY(-50%);
  background-color: var(--horizontalScroll-color-scrollbarTrack);
  border-radius: 1px;
  transition: background-color 0.2s ease;
}

.horizontalScroll__scrollbarTrack:hover::before {
  background-color: var(--horizontalScroll-color-scrollbarTrack-hover);
}

.horizontalScroll__scrollbarThumb {
  position: absolute;
  top: 50%;
  left: 0;
  height: 2px;
  transform: translateY(-50%);
  background-color: var(--horizontalScroll-color-scrollbarThumb);
  border-radius: 1px;
  transition: background-color 0.2s ease;
  pointer-events: none;
}

.horizontalScroll__scrollbarTrack:hover .horizontalScroll__scrollbarThumb {
  background-color: var(--horizontalScroll-color-scrollbarThumb-hover);
}
</style>
