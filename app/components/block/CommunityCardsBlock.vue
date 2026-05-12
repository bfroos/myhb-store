<template>
  <section class="community-section" :class="[themeClass]">
    <h2 v-if="heading" class="community__heading">{{ heading }}</h2>
    
    <div class="community__grid">
      <a
        v-for="(card, idx) in cards"
        :key="idx"
        :href="card.cta.link"
        target="_blank"
        rel="noopener noreferrer"
        class="community-card"
        :title="`Visit ${card.title}`"
      >
        <div class="community-card__icon" aria-hidden="true">{{ card.icon }}</div>
        <h3 class="community-card__title">{{ card.title }}</h3>
        <p v-if="card.members" class="community-card__members">{{ card.members }}</p>
        <p v-if="card.description" class="community-card__desc">{{ card.description }}</p>
        <span class="community-card__cta">
          {{ card.cta.text }}
          <span class="community-card__arrow" aria-hidden="true">→</span>
        </span>
      </a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface CommunityCard {
  icon: string;           // emoji or icon name
  title: string;          // "Discord", "Instagram", etc.
  members?: string;       // "2K+", "50K+", etc.
  description?: string;   // "Real-time chat, support"
  cta: {
    text: string;         // "Join Now", "Follow", etc.
    link: string;         // URL or handle
  };
}

const props = withDefaults(defineProps<{
  cards: CommunityCard[];
  heading?: string;
  layout?: 'stack' | 'grid';  // default: responsive
  themeClass?: 'theme-light' | 'theme-soft' | 'theme-neutral' | 'theme-strong';
}>(), {
  layout: 'grid',
  themeClass: 'theme-light'
});

const gridClass = computed(() => {
  if (props.layout === 'stack') return 'grid-cols-1';
  return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
});
</script>

<style scoped>
.community-section {
  background: var(--card-color-bg, #ffffff);
  color: var(--color-text, #1a1a1a);
  border-radius: var(--border-radius-card, 12px);
  padding: var(--space-section-pad, 24px) var(--space-section-pad-x, 20px);
}

@media (min-width: 768px) {
  .community-section {
    padding: var(--space-section-pad, 40px) var(--space-section-pad-x, 32px);
  }
}

.community__heading {
  font-size: var(--font-2xl, 28px);
  font-weight: var(--font-bold, 700);
  line-height: var(--line-tight, 1.2);
  letter-spacing: var(--letter-tight, -0.01em);
  margin-bottom: 24px;
  text-align: center;
}

.community__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}

@media (min-width: 640px) {
  .community__grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (min-width: 1024px) {
  .community__grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}

.community-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: var(--card-bg, #f8f8f8);
  border: 1px solid var(--card-border, #e0e0e0);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  min-height: 200px;
  text-align: center;
  position: relative;
}

@media (min-width: 768px) {
  .community-card {
    padding: 28px 20px;
    min-height: 220px;
  }
}

.community-card:hover {
  border-color: var(--color-brand, #ff1493);
  box-shadow: 0 4px 12px rgba(255, 20, 147, 0.1);
  transform: translateY(-2px);
}

.community-card:focus-visible {
  outline: 2px solid var(--color-brand, #ff1493);
  outline-offset: 2px;
}

.community-card__icon {
  font-size: 40px;
  line-height: 1;
  display: block;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (min-width: 768px) {
  .community-card__icon {
    font-size: 48px;
    min-height: 56px;
  }
}

.community-card__title {
  font-size: var(--font-lg, 18px);
  font-weight: var(--font-semibold, 600);
  line-height: var(--line-normal, 1.4);
  margin: 0;
  word-break: break-word;
}

@media (min-width: 768px) {
  .community-card__title {
    font-size: var(--font-xl, 20px);
  }
}

.community-card__members {
  font-size: var(--font-sm, 14px);
  color: var(--color-text-secondary, #666);
  margin: 0;
  font-weight: var(--font-semibold, 600);
  letter-spacing: 0.5px;
}

.community-card__desc {
  font-size: var(--font-sm, 14px);
  color: var(--color-text-light, #999);
  margin: 0;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  word-break: break-word;
}

.community-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-sm, 14px);
  font-weight: var(--font-semibold, 600);
  color: var(--color-brand, #ff1493);
  text-decoration: none;
  transition: gap 0.3s ease;
  margin-top: auto;
  padding: 8px 0;
}

.community-card:hover .community-card__cta {
  gap: 10px;
}

.community-card__arrow {
  display: inline-block;
  transition: transform 0.3s ease;
  font-weight: 700;
}

.community-card:hover .community-card__arrow {
  transform: translateX(3px);
}

/* Theme Variants */
.theme-light {
  background: var(--card-color-bg, #ffffff);
  border: 1px solid var(--card-border, #e0e0e0);
}

.theme-soft {
  background: var(--bg-soft, #f5f0ff);
  border: 1px solid var(--border-soft, #e8dff5);
}

.theme-neutral {
  background: var(--bg-neutral, #fafafa);
  border: 1px solid var(--border-neutral, #f0f0f0);
}

.theme-strong {
  background: var(--bg-strong, #f0f0f0);
  border: 1px solid var(--border-strong, #e0e0e0);
}

/* Responsive adjustments for 375px screens */
@media (max-width: 480px) {
  .community-section {
    padding: 20px 16px;
  }

  .community__heading {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .community__grid {
    gap: 12px;
  }

  .community-card {
    padding: 16px;
    min-height: 180px;
  }

  .community-card__icon {
    font-size: 36px;
    min-height: 40px;
  }

  .community-card__title {
    font-size: 16px;
  }

  .community-card__members {
    font-size: 12px;
  }

  .community-card__desc {
    font-size: 13px;
    min-height: 35px;
  }
}

/* Large screens (1920px+) */
@media (min-width: 1920px) {
  .community__grid {
    gap: 32px;
  }

  .community-card {
    padding: 32px 24px;
    min-height: 240px;
  }

  .community-card__icon {
    font-size: 56px;
    min-height: 64px;
  }
}
</style>
