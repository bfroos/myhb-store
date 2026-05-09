<template>
  <div class="before-after-slider">
    <img :src="before" :alt="`${alt} - Before`" class="before-image" />
    <img :src="after" :alt="`${alt} - After`" class="after-image" />
    <div class="slider-handle" @mousedown="startDrag" @touchstart="startDrag">
      <span class="slider-label-before">Vorher</span>
      <span class="slider-label-after">Nachher</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  before: String,
  after: String,
  alt: String
});

const sliderContainer = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const sliderPosition = ref(50);

const startDrag = (event: MouseEvent | TouchEvent) => {
  isDragging.value = true;
  updateSlider(event);
};

const updateSlider = (event: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return;

  const container = sliderContainer.value;
  if (!container) return;

  const rect = container.getBoundingClientRect();
  const clientX = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
  const x = clientX - rect.left;
  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

  sliderPosition.value = percentage;
};

const stopDrag = () => {
  isDragging.value = false;
};

onMounted(() => {
  document.addEventListener('mousemove', updateSlider);
  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchmove', updateSlider);
  document.addEventListener('touchend', stopDrag);
});

onUnmounted(() => {
  document.removeEventListener('mousemove', updateSlider);
  document.removeEventListener('mouseup', stopDrag);
  document.removeEventListener('touchmove', updateSlider);
  document.removeEventListener('touchend', stopDrag);
});
</script>

<style scoped lang="scss">
.before-after-slider {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  border-radius: 8px;
  user-select: none;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .before-image {
    z-index: 1;
  }

  .after-image {
    z-index: 0;
    clip-path: v-bind("'inset(0 ' + (100 - sliderPosition) + '% 0 0)'");
  }

  .slider-handle {
    position: absolute;
    top: 0;
    left: v-bind("sliderPosition + '%'");
    width: 48px;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    cursor: ew-resize;
    z-index: 10;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 8px;
    transform: translateX(-50%);
    transition: background-color 0.2s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.5);
    }

    .slider-label-before,
    .slider-label-after {
      color: white;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
    }
  }
}
</style>
