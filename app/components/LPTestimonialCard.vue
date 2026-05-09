<template>
  <div class="testimonial-card">
    <div class="testimonial-header">
      <img :src="avatar" :alt="name" class="avatar" />
      <div class="testimonial-info">
        <p class="name">{{ name }}</p>
        <p class="age">{{ age }} Jahre</p>
      </div>
    </div>
    <div class="testimonial-rating">
      <span v-for="i in 5" :key="i" class="star">⭐</span>
    </div>
    <p class="testimonial-text">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
defineProps({
  name: String,
  age: Number,
  text: String,
  rating: Number,
  avatar: String
});
</script>

<style scoped lang="scss">
.testimonial-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  border-left: 4px solid #D4A574;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .testimonial-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }

    .testimonial-info {
      .name {
        font-weight: bold;
        color: #2C2C2C;
        margin: 0;
      }

      .age {
        font-size: 14px;
        color: #757575;
        margin: 4px 0 0 0;
      }
    }
  }

  .testimonial-rating {
    margin-bottom: 12px;

    .star {
      font-size: 16px;
    }
  }

  .testimonial-text {
    color: #757575;
    line-height: 1.6;
    margin: 0;
    font-size: 14px;
  }
}
</style>
