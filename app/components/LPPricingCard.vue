<template>
  <div class="pricing-card" :class="{ featured }">
    <div v-if="featured" class="featured-badge">TOP-ANGEBOT</div>
    <h3 class="pricing-name">{{ name }}</h3>
    <p class="pricing-amount">{{ amount }}</p>
    <p class="pricing-description">{{ description }}</p>
    <ul class="pricing-features">
      <li v-for="(feature, index) in parsedFeatures" :key="index">
        {{ feature }}
      </li>
    </ul>
    <NuxtLink to="#booking" class="btn btn-primary">
      {{ cta }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
defineProps({
  name: String,
  amount: String,
  description: String,
  features: {
    type: String,
    default: '[]'
  },
  cta: String,
  featured: {
    type: Boolean,
    default: false
  }
});

const props = defineProps({
  features: String
});

const parsedFeatures = computed(() => {
  try {
    return JSON.parse(props.features || '[]');
  } catch {
    return [];
  }
});
</script>

<style scoped lang="scss">
.pricing-card {
  background: white;
  border: 2px solid #E8E8E8;
  border-radius: 8px;
  padding: 32px;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: #D4A574;
  }

  &.featured {
    border-color: #D4A574;
    background: linear-gradient(135deg, rgba(212, 165, 116, 0.05) 0%, rgba(139, 111, 71, 0.05) 100%);
    transform: scale(1.05);

    @media (max-width: 768px) {
      transform: scale(1);
    }

    .featured-badge {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      background: #D4A574;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
    }
  }

  .pricing-name {
    font-size: 20px;
    font-weight: bold;
    color: #2C2C2C;
    margin-bottom: 12px;
  }

  .pricing-amount {
    font-size: 36px;
    font-weight: bold;
    color: #D4A574;
    margin-bottom: 8px;
  }

  .pricing-description {
    font-size: 14px;
    color: #757575;
    margin-bottom: 24px;
  }

  .pricing-features {
    list-style: none;
    padding: 0;
    margin-bottom: 24px;

    li {
      padding: 8px 0;
      color: #2C2C2C;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;

      &:before {
        content: '✓';
        color: #D4A574;
        font-weight: bold;
      }
    }
  }

  .btn {
    width: 100%;
    padding: 14px 24px;
    background: #E8424F;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: block;
    text-align: center;

    &:hover {
      background: #D63039;
      box-shadow: 0 4px 12px rgba(232, 66, 79, 0.3);
    }
  }
}
</style>
