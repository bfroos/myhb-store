<template>
  <div class="lip-filler-page">
    <!-- Breadcrumb -->
    <UiOrganismBaseBreadcrumb v-if="!isAdsMode" :items="breadcrumbItems" />

    <!-- 1. HERO Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-headline">{{ fixedBlocks.hero.headline }}</h1>
        <p class="hero-subline">{{ fixedBlocks.hero.subline }}</p>
        <p class="hero-text">{{ fixedBlocks.hero.text }}</p>
        
        <div class="hero-trust-badges">
          <span v-for="badge in fixedBlocks.hero.trustBadges" :key="badge" class="badge">
            ✓ {{ badge }}
          </span>
        </div>

        <NuxtLink :to="fixedBlocks.hero.ctaLink" class="btn btn-primary btn-lg">
          {{ fixedBlocks.hero.ctaText }}
        </NuxtLink>
      </div>
    </section>

    <!-- 2. Before/After Gallery -->
    <section class="before-after-section">
      <div class="container">
        <h2>{{ fixedBlocks.beforeAfter.headline }}</h2>
        <p class="section-subtitle">{{ fixedBlocks.beforeAfter.description }}</p>
        
        <div class="gallery-grid">
          <div v-for="i in 4" :key="i" class="gallery-item">
            <div class="before-after-placeholder">
              <div class="before">Vorher</div>
              <div class="after">Nachher</div>
            </div>
            <p class="gallery-label">Patient {{ i }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Benefits Grid -->
    <section class="benefits-section">
      <div class="container">
        <h2>{{ fixedBlocks.benefits.headline }}</h2>
        
        <div class="benefits-grid">
          <div v-for="benefit in fixedBlocks.benefits.items" :key="benefit.title" class="benefit-card">
            <div class="benefit-icon">{{ benefit.icon }}</div>
            <h3>{{ benefit.title }}</h3>
            <p>{{ benefit.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Testimonials -->
    <section class="testimonials-section">
      <div class="container">
        <h2>{{ fixedBlocks.testimonials.headline }}</h2>
        
        <div class="testimonials-grid">
          <div v-for="testimonial in fixedBlocks.testimonials.items" :key="testimonial.name" class="testimonial-card">
            <div class="stars">
              <span v-for="n in testimonial.rating" :key="n">⭐</span>
            </div>
            <p class="testimonial-text">"{{ testimonial.text }}"</p>
            <p class="testimonial-author">
              <strong>{{ testimonial.name }}</strong>, {{ testimonial.age }} Jahre
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Pricing -->
    <section class="pricing-section">
      <div class="container">
        <h2>{{ fixedBlocks.pricing.headline }}</h2>
        
        <div class="pricing-grid">
          <div 
            v-for="price in fixedBlocks.pricing.items" 
            :key="price.name"
            class="price-card"
            :class="{ featured: price.featured }"
          >
            <div v-if="price.featured" class="featured-badge">TOP SELLER</div>
            <h3>{{ price.name }}</h3>
            <p class="volume">{{ price.volume }}</p>
            <p class="amount">{{ price.amount }}</p>
            <p class="description">{{ price.description }}</p>
            <ul class="features">
              <li v-for="feature in price.features" :key="feature">
                ✓ {{ feature }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. FAQ Accordion -->
    <section class="faq-section">
      <div class="container">
        <h2>{{ fixedBlocks.faq.headline }}</h2>
        
        <div class="faq-accordion">
          <details v-for="(item, index) in fixedBlocks.faq.items" :key="index" class="faq-item">
            <summary class="faq-question">
              {{ item.question }}
              <span class="faq-toggle">+</span>
            </summary>
            <p class="faq-answer">{{ item.answer }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- 7. Guarantee -->
    <section class="guarantee-section">
      <div class="container">
        <div class="guarantee-content">
          <div class="guarantee-icon">{{ fixedBlocks.guarantee.icon }}</div>
          <h2>{{ fixedBlocks.guarantee.headline }}</h2>
          <p class="guarantee-description">{{ fixedBlocks.guarantee.description }}</p>
          
          <ul class="guarantee-list">
            <li v-for="item in fixedBlocks.guarantee.items" :key="item">
              {{ item }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 8. Booking CTA -->
    <section id="booking" class="booking-section">
      <div class="container">
        <h2>{{ fixedBlocks.booking.headline }}</h2>
        <p class="booking-subtitle">{{ fixedBlocks.booking.subheadline }}</p>
        
        <div class="booking-form">
          <div class="form-group">
            <label for="name">Name</label>
            <input id="name" v-model="form.name" type="text" placeholder="Dein Name" />
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input id="email" v-model="form.email" type="email" placeholder="deine@email.de" />
          </div>
          
          <div class="form-group">
            <label for="phone">Telefon</label>
            <input id="phone" v-model="form.phone" type="tel" placeholder="+49 ..." />
          </div>
          
          <div class="form-group">
            <label for="volume">Gewünschte Menge</label>
            <select id="volume" v-model="form.volume">
              <option value="">-- Wählen --</option>
              <option value="0.5">Subtle Hydration (0.5 mL)</option>
              <option value="1">Full Volume (1 mL)</option>
              <option value="1.5">Ultimate Fuller (1.5 mL)</option>
            </select>
          </div>
          
          <button @click="submitForm" class="btn btn-primary btn-lg">
            Kostenlose Beratung buchen
          </button>
          
          <p class="form-note">{{ fixedBlocks.booking.note }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const { isAdsMode } = useSiteModeFlags();
const { fixedBlocks, breadcrumbItems, seo } = useLipFillerPage();

// Form state
const form = ref({
  name: '',
  email: '',
  phone: '',
  volume: ''
});

// Set page SEO
useHead({
  title: seo.value.metaTitle,
  meta: [
    { name: 'description', content: seo.value.metaDescription },
    { name: 'keywords', content: seo.value.keywords }
  ]
});

// Form submit
const submitForm = () => {
  if (!form.value.name || !form.value.email) {
    alert('Bitte fülle alle Felder aus');
    return;
  }
  
  console.log('Booking:', form.value);
  alert('Danke! Wir kontaktieren dich in Kürze!');
};
</script>

<style scoped lang="scss">
$primary: #D4A574;
$secondary: #8B6F47;
$accent: #E8424F;
$bg-light: #F5F1ED;
$dark: #2C2C2C;
$gray: #757575;

.lip-filler-page {
  width: 100%;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-section {
  background: linear-gradient(135deg, $primary 0%, $secondary 100%);
  color: white;
  padding: 80px 20px;
  text-align: center;

  .hero-headline {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 16px;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 32px;
    }
  }

  .hero-subline {
    font-size: 20px;
    margin-bottom: 16px;
    opacity: 0.95;
  }

  .hero-text {
    font-size: 16px;
    margin-bottom: 32px;
    opacity: 0.9;
  }

  .hero-trust-badges {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 32px;
    align-items: center;

    .badge {
      font-size: 14px;
      display: inline-block;
    }
  }
}

section {
  padding: 60px 0;
  border-bottom: 1px solid #e0e0e0;

  &:last-child {
    border-bottom: none;
  }

  h2 {
    font-size: 36px;
    color: $dark;
    margin-bottom: 40px;
    text-align: center;
    font-weight: bold;

    @media (max-width: 768px) {
      font-size: 24px;
      margin-bottom: 30px;
    }
  }
}

.section-subtitle {
  text-align: center;
  color: $gray;
  margin-bottom: 40px;
  font-size: 16px;
}

.before-after-section {
  background: $bg-light;

  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 24px;
  }

  .gallery-item {
    text-align: center;
  }

  .before-after-placeholder {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 16px;
    border-radius: 8px;
    overflow: hidden;

    .before, .after {
      padding: 60px 20px;
      background: white;
      border: 2px solid #ddd;
      font-weight: bold;
      color: $gray;
    }

    .before {
      border-right: none;
    }
  }

  .gallery-label {
    font-size: 14px;
    color: $secondary;
    font-weight: 500;
  }
}

.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.benefit-card {
  background: white;
  padding: 32px;
  border-radius: 8px;
  border-left: 4px solid $primary;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }

  .benefit-icon {
    font-size: 40px;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
    margin-bottom: 12px;
    color: $dark;
    font-weight: bold;
  }

  p {
    color: $gray;
    line-height: 1.6;
  }
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.testimonial-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  border-left: 4px solid $primary;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .stars {
    margin-bottom: 12px;
  }

  .testimonial-text {
    color: $dark;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 16px;
    font-style: italic;
  }

  .testimonial-author {
    font-size: 13px;
    color: $secondary;
  }
}

.pricing-section {
  background: $bg-light;

  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }
}

.price-card {
  background: white;
  padding: 32px;
  border-radius: 8px;
  border: 2px solid #ddd;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;

  &.featured {
    border-color: $primary;
    box-shadow: 0 8px 24px rgba(212, 165, 116, 0.2);
    transform: scale(1.05);

    @media (max-width: 768px) {
      transform: scale(1);
    }
  }

  .featured-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: $accent;
    color: white;
    padding: 4px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
  }

  h3 {
    font-size: 20px;
    margin-bottom: 12px;
    color: $dark;
    font-weight: bold;
  }

  .volume {
    font-size: 13px;
    color: $gray;
    margin-bottom: 8px;
  }

  .amount {
    font-size: 32px;
    color: $primary;
    font-weight: bold;
    margin-bottom: 12px;
  }

  .description {
    font-size: 13px;
    color: $gray;
    margin-bottom: 20px;
  }

  .features {
    list-style: none;
    padding: 0;
    text-align: left;

    li {
      padding: 8px 0;
      color: $dark;
      font-size: 13px;
      line-height: 1.6;
    }
  }
}

.faq-accordion {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  margin-bottom: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;

  summary {
    padding: 16px 20px;
    background: white;
    cursor: pointer;
    font-weight: 500;
    color: $dark;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;

    &:hover {
      background: $bg-light;
    }

    .faq-toggle {
      font-size: 20px;
      color: $primary;
      transition: transform 0.3s ease;
    }
  }

  &[open] summary {
    background: $bg-light;
    border-bottom: 1px solid #ddd;

    .faq-toggle {
      transform: rotate(45deg);
    }
  }

  .faq-answer {
    padding: 16px 20px;
    color: $gray;
    line-height: 1.6;
  }
}

.guarantee-section {
  background: linear-gradient(135deg, rgba($primary, 0.1) 0%, rgba($secondary, 0.1) 100%);

  .guarantee-content {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
  }

  .guarantee-icon {
    font-size: 60px;
    margin-bottom: 24px;
  }

  .guarantee-description {
    color: $dark;
    margin-bottom: 32px;
    font-size: 16px;
  }

  .guarantee-list {
    list-style: none;
    padding: 0;
    text-align: left;

    li {
      padding: 12px 0;
      color: $dark;
      font-size: 14px;
    }
  }
}

.booking-section {
  background: $bg-light;
  text-align: center;

  .booking-subtitle {
    font-size: 18px;
    color: $dark;
    margin-bottom: 32px;
  }

  .booking-form {
    max-width: 500px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  .form-group {
    margin-bottom: 20px;
    text-align: left;

    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: $dark;
      font-size: 14px;
    }

    input, select {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      font-family: inherit;

      &:focus {
        outline: none;
        border-color: $primary;
        box-shadow: 0 0 0 3px rgba(212, 165, 116, 0.1);
      }
    }
  }

  .form-note {
    margin-top: 20px;
    font-size: 12px;
    color: $accent;
    font-weight: bold;
  }
}

.btn {
  padding: 14px 32px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  display: inline-block;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;

  &.btn-primary {
    background: $accent;
    color: white;

    &:hover {
      background: darken($accent, 10%);
      box-shadow: 0 4px 12px rgba($accent, 0.3);
    }
  }

  &.btn-lg {
    padding: 16px 48px;
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  section {
    padding: 40px 0;

    h2 {
      font-size: 24px;
      margin-bottom: 24px;
    }
  }

  .hero-section {
    padding: 60px 20px;
  }

  .pricing-grid,
  .benefits-grid,
  .testimonials-grid {
    grid-template-columns: 1fr;
  }

  .booking-form {
    padding: 24px;
  }
}
</style>
