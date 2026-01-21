<template>
  <div class="horizontalScroll">
    <div
      ref="scrollContainer"
      class="horizontalScroll__container"
      @scroll="updateScrollbar"
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

const updateScrollbar = () => {
  if (!scrollContainer.value) return;

  const container = scrollContainer.value;
  const scrollWidth = container.scrollWidth;
  const clientWidth = container.clientWidth;
  const scrollLeft = container.scrollLeft;
  const maxScrollLeft = scrollWidth - clientWidth;

  // Berechne die Breite des Thumbs basierend auf dem sichtbaren Bereich
  if (scrollWidth > clientWidth) {
    scrollbarThumbWidth.value = (clientWidth / scrollWidth) * 100;
  } else {
    scrollbarThumbWidth.value = 100;
  }

  // Berechne die Position des Thumbs
  if (maxScrollLeft > 0) {
    scrollbarThumbLeft.value =
      (scrollLeft / maxScrollLeft) * (100 - scrollbarThumbWidth.value);
  } else {
    scrollbarThumbLeft.value = 0;
  }

  // Aktualisiere Button-Status
  canScrollLeft.value = scrollLeft > 0;
  canScrollRight.value = scrollLeft < maxScrollLeft - 1; // -1 für Rundungsfehler
};

const scrollToNext = () => {
  if (!scrollContainer.value) return;

  const container = scrollContainer.value;
  const children = Array.from(container.children) as HTMLElement[];

  if (children.length === 0) return;

  const containerRect = container.getBoundingClientRect();
  const scrollLeft = container.scrollLeft;
  const containerWidth = container.clientWidth;

  // Finde das erste Element, das nicht vollständig sichtbar ist
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (!child) continue;

    const childRect = child.getBoundingClientRect();
    const childLeft = childRect.left - containerRect.left + scrollLeft;

    // Wenn das Element rechts vom sichtbaren Bereich ist, scrolle zu ihm
    if (childLeft + childRect.width > scrollLeft + containerWidth) {
      // scrollIntoView berücksichtigt automatisch scroll-padding
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
  if (!scrollContainer.value) return;

  const container = scrollContainer.value;
  const children = Array.from(container.children) as HTMLElement[];

  if (children.length === 0) return;

  const containerRect = container.getBoundingClientRect();
  const scrollLeft = container.scrollLeft;

  // Finde das letzte Element, das nicht vollständig sichtbar ist
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
    if (!child) continue;

    const childRect = child.getBoundingClientRect();
    const childLeft = childRect.left - containerRect.left + scrollLeft;

    // Wenn das Element links vom sichtbaren Bereich ist, scrolle zu ihm
    if (childLeft < scrollLeft) {
      // scrollIntoView berücksichtigt automatisch scroll-padding
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
  if (!scrollContainer.value || !scrollbarTrack.value) return;

  const trackRect = scrollbarTrack.value.getBoundingClientRect();
  const clickX = event.clientX - trackRect.left;
  const clickPercent = clickX / trackRect.width;

  scrollToPosition(clickPercent);
};

const scrollToPosition = (percent: number) => {
  if (!scrollContainer.value) return;

  const container = scrollContainer.value;
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
  if (!scrollContainer.value) return;

  const container = scrollContainer.value;
  const scrollWidth = container.scrollWidth;
  const clientWidth = container.clientWidth;
  const maxScrollLeft = scrollWidth - clientWidth;
  const currentScrollLeft = container.scrollLeft;
  const scrollPercent =
    maxScrollLeft > 0 ? currentScrollLeft / maxScrollLeft : 0;
  const stepPercent = 0.1; // 10% pro Schritt

  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const newPercent = Math.max(
      0,
      Math.min(1, scrollPercent + direction * stepPercent)
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
  updateScrollbar();
};

onMounted(() => {
  updateScrollbar();
  window.addEventListener("resize", handleResize);

  // Verwende ResizeObserver für bessere Performance bei Container-Änderungen
  if (scrollContainer.value) {
    const resizeObserver = new ResizeObserver(() => {
      updateScrollbar();
    });
    resizeObserver.observe(scrollContainer.value);

    // Cleanup beim Unmount
    onUnmounted(() => {
      resizeObserver.disconnect();
    });
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
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
