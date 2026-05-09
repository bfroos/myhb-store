<template>
  <div class="faq-item">
    <button 
      class="faq-trigger"
      @click="isOpen = !isOpen"
      :aria-expanded="isOpen"
    >
      <span class="faq-question">{{ question }}</span>
      <span class="faq-icon" :class="{ open: isOpen }">›</span>
    </button>
    <transition name="faq-content">
      <div v-if="isOpen" class="faq-content">
        <p>{{ answer }}</p>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
defineProps({
  question: String,
  answer: String
});

const isOpen = ref(false);
</script>

<style scoped lang="scss">
.faq-item {
  border-bottom: 1px solid #E8E8E8;
  padding: 16px 0;

  &:last-child {
    border-bottom: none;
  }

  .faq-trigger {
    width: 100%;
    background: none;
    border: none;
    padding: 12px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    color: #2C2C2C;
    transition: color 0.2s ease;

    &:hover {
      color: #D4A574;
    }

    .faq-icon {
      font-size: 24px;
      transition: transform 0.3s ease;
      color: #D4A574;

      &.open {
        transform: rotate(90deg);
      }
    }
  }

  .faq-content {
    padding: 12px 0;
    color: #757575;
    line-height: 1.6;

    p {
      margin: 0;
    }
  }
}

.faq-content-enter-active,
.faq-content-leave-active {
  transition: all 0.3s ease;
}

.faq-content-enter-from,
.faq-content-leave-to {
  opacity: 0;
  max-height: 0;
}

.faq-content-enter-to,
.faq-content-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>
