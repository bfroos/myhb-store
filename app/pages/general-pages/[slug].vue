<template>
  <div class="general-page">
    <!-- Breadcrumb -->
    <UiOrganismBaseBreadcrumb v-if="!isAdsMode" :items="breadcrumbItems" />

    <!-- Hero Section (from Strapi data) -->
    <section class="hero" v-if="page?.hero">
      <div class="hero-content">
        <div class="hero-text">
          <h1 class="hero-headline">{{ page.hero.headline }}</h1>
          <p class="hero-subheadline">{{ page.hero.subheadline }}</p>
          <div v-if="page.hero.trustBadges" class="hero-trust">
            <span v-for="(badge, index) in page.hero.trustBadges" :key="index" class="trust-badge">
              ✓ {{ badge }}
            </span>
          </div>
          <NuxtLink :to="`#booking`" class="btn btn-primary" v-if="page.hero.ctaText">
            {{ page.hero.ctaText }}
          </NuxtLink>
        </div>
        <div v-if="page.hero.image" class="hero-image">
          <img 
            :src="page.hero.image"
            :alt="page.hero.headline"
            loading="lazy"
          />
        </div>
      </div>
    </section>

    <!-- Dynamic Content Blocks (from Strapi) -->
    <section v-for="(block, index) in page?.contentBlocks" :key="index" :class="`section-${block.type}`">
      <div class="container">
        <!-- Before/After Gallery Block -->
        <template v-if="block.type === 'gallery'">
          <h2>{{ block.title }}</h2>
          <div class="gallery-grid">
            <div v-for="(item, i) in block.items" :key="i" class="gallery-item">
              <LPBeforeAfterSlider 
                :before="item.before"
                :after="item.after"
                :alt="item.label"
              />
              <p class="gallery-label">{{ item.label }}</p>
            </div>
          </div>
        </template>

        <!-- Video Block -->
        <template v-if="block.type === 'video'">
          <h2>{{ block.title }}</h2>
          <div class="video-container">
            <iframe 
              v-if="block.youtubeId"
              width="100%" 
              height="600" 
              :src="`https://www.youtube.com/embed/${block.youtubeId}`"
              :title="block.title"
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
          </div>
          <p v-if="block.description" class="video-description">{{ block.description }}</p>
        </template>

        <!-- Testimonials Block -->
        <template v-if="block.type === 'testimonials'">
          <h2>{{ block.title }}</h2>
          <div class="testimonials-grid">
            <LPTestimonialCard 
              v-for="testimonial in block.items" 
              :key="testimonial.id"
              :name="testimonial.name"
              :age="testimonial.age"
              :text="testimonial.text"
              :rating="testimonial.rating"
              :avatar="testimonial.avatar"
            />
          </div>
        </template>

        <!-- Benefits Block -->
        <template v-if="block.type === 'benefits'">
          <h2>{{ block.title }}</h2>
          <div class="benefits-grid">
            <div v-for="(benefit, i) in block.items" :key="i" class="benefit-card">
              <div class="benefit-icon">{{ benefit.icon }}</div>
              <h3>{{ benefit.title }}</h3>
              <p>{{ benefit.description }}</p>
            </div>
          </div>
        </template>

        <!-- Pricing Block -->
        <template v-if="block.type === 'pricing'">
          <h2>{{ block.title }}</h2>
          <div class="pricing-cards">
            <LPPricingCard 
              v-for="(card, i) in block.items"
              :key="i"
              :name="card.name"
              :amount="card.amount"
              :description="card.description"
              :features="JSON.stringify(card.features)"
              :cta="block.ctaText"
              :featured="card.featured"
            />
          </div>
        </template>

        <!-- FAQ Block -->
        <template v-if="block.type === 'faq'">
          <h2>{{ block.title }}</h2>
          <div class="faq-accordion">
            <LPFAQItem 
              v-for="(item, i) in block.items"
              :key="i"
              :question="item.question"
              :answer="item.answer"
            />
          </div>
        </template>

        <!-- Guarantee Block -->
        <template v-if="block.type === 'guarantee'">
          <h2>{{ block.title }}</h2>
          <div class="guarantee-content">
            <div v-if="block.icon" class="guarantee-icon">{{ block.icon }}</div>
            <h3>{{ block.subtitle }}</h3>
            <p>{{ block.description }}</p>
            <ul v-if="block.items" class="guarantee-list">
              <li v-for="(item, i) in block.items" :key="i">{{ item }}</li>
            </ul>
          </div>
        </template>

        <!-- Rich Text Block -->
        <template v-if="block.type === 'richtext'">
          <div v-html="block.content" class="richtext-content"></div>
        </template>
      </div>
    </section>

    <!-- Booking Section -->
    <section v-if="page?.booking" id="booking" class="section-booking">
      <div class="container">
        <h2>{{ page.booking.title }}</h2>
        <LPBookingForm 
          :treatment="page.treatment"
          :personas="personasForForm"
        />
        <p v-if="page.booking.subtitle" class="cta-subtext">
          {{ page.booking.subtitle }}
        </p>
      </div>
    </section>

    <!-- Footer CTA (if ads mode) -->
    <template v-if="isAdsMode">
      <section class="section-ads-footer">
        <div class="container">
          <h2>{{ page?.treatment }} — Jetzt buchen</h2>
          <NuxtLink to="#booking" class="btn btn-primary">
            Kostenlose Beratung
          </NuxtLink>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const { isAdsMode } = useSiteModeFlags();

// Fetch page from Strapi
const pageSlug = route.params.slug as string;

let page = ref<any>(null);
let breadcrumbItems = ref<any[]>([]);
let seo = ref<any>(null);

// Mock data for PAGE 2 (Lip Filler - Strapi variant)
// In production, replace with actual Strapi fetch
const mockPageData = {
  slug: 'lip-filler-lp-strapi',
  treatment: 'Lippenaufpolsterung',
  title: 'Lippenaufpolsterung | My Health & Beauty',
  description: 'Professionelle Lippenaufpolsterung mit natürlichen Ergebnissen.',
  
  hero: {
    headline: 'Natürliche volle Lippen – Jetzt möglich',
    subheadline: 'Board-zertifizierte Ärzte. Transparente Preise. 30-Tage Garantie.',
    image: '/images/lip-filler-hero.jpg',
    trustBadges: ['1000+ zufriedene Patienten', 'Board-zertifizierte Ärzte'],
    ctaText: 'Kostenlose Beratung buchen'
  },

  contentBlocks: [
    {
      type: 'gallery',
      title: 'Natürliche Ergebnisse – Echte Patienten',
      items: [
        {
          before: '/images/lip-before-1.jpg',
          after: '/images/lip-after-1.jpg',
          label: 'Subtile Hydration (0.5mL)'
        },
        {
          before: '/images/lip-before-2.jpg',
          after: '/images/lip-after-2.jpg',
          label: 'Volles Volumen (1mL)'
        },
        {
          before: '/images/lip-before-3.jpg',
          after: '/images/lip-after-3.jpg',
          label: 'Luxe Fuller (1.5mL)'
        },
        {
          before: '/images/lip-before-4.jpg',
          after: '/images/lip-after-4.jpg',
          label: 'Natürliche Asymmetrie-Korrektur'
        }
      ]
    },
    {
      type: 'video',
      title: 'So funktioniert Lippenaufpolsterung',
      youtubeId: 'qKIJyK7wVrA',
      description: 'Dr. Jon Mendelsohn zeigt echte Patienten-Transformationen mit natürlichen, ausgewogenen Ergebnissen.'
    },
    {
      type: 'testimonials',
      title: 'Was unsere Patienten sagen',
      items: [
        {
          id: 1,
          name: 'Claire S.',
          age: 32,
          text: 'Ich war nervös, aber die Ärzte haben mich sofort beruhigt. Meine Lippen sehen natürlich aus – nicht "gemacht".',
          rating: 5,
          avatar: '/avatars/claire.jpg'
        },
        {
          id: 2,
          name: 'Regina M.',
          age: 48,
          text: 'Nach meiner Scheidung wollte ich mich wieder jung fühlen. Das ist nicht dramatisch, aber ich FÜHLE den Unterschied.',
          rating: 5,
          avatar: '/avatars/regina.jpg'
        },
        {
          id: 3,
          name: 'Bella L.',
          age: 26,
          text: 'Definitionen sind alles! Meine Lippen sind jetzt ein echtes Statement.',
          rating: 5,
          avatar: '/avatars/bella.jpg'
        },
        {
          id: 4,
          name: 'Teresa K.',
          age: 52,
          text: 'Ich war skeptisch zu Anfang, aber die Beratung war sehr wissenschaftlich. Ich fühle mich jetzt authentischer.',
          rating: 5,
          avatar: '/avatars/teresa.jpg'
        }
      ]
    },
    {
      type: 'benefits',
      title: 'Warum Lippen Aufpolsterung?',
      items: [
        {
          icon: '💋',
          title: 'Volle, definierte Lippen',
          description: 'Natürliche Volumensteigerung für mehr Ausstrahlung und Jugendlichkeit.'
        },
        {
          icon: '⚡',
          title: 'Schnell & unkompliziert',
          description: 'Nur 15-30 Minuten. Walk-in, walk-out. Arbeits- und sozialfähig sofort.'
        },
        {
          icon: '🎯',
          title: 'Natürliche Ergebnisse',
          description: 'Kein "Fake-Look". Wir stärken deine Lippen genau richtig.'
        },
        {
          icon: '🛡️',
          title: 'Sicher & reversibel',
          description: 'Hyaluronsäure-Filler. Körperverträglich. Kann bei Bedarf aufgelöst werden.'
        },
        {
          icon: '💰',
          title: 'Flexible Finanzierung',
          description: 'Zahlungsplan ab €49/Monat. Keine versteckten Kosten.'
        },
        {
          icon: '📞',
          title: 'Virtual Consultation',
          description: 'Online-Beratung mit dem Arzt. Kostenlos. Unverbindlich.'
        }
      ]
    },
    {
      type: 'pricing',
      title: 'Klare Preise – Keine Überraschungen',
      ctaText: 'Beratung buchen',
      items: [
        {
          name: 'Subtle Hydration',
          amount: '€299',
          description: '0.5 mL - Perfekt für erste Mal',
          features: ['Hauch von Volumen', 'Natürlicher Look', 'Hält 3-4 Monate']
        },
        {
          name: 'Full Volume (Beliebtest)',
          amount: '€499',
          description: '1 mL - Perfektes Gleichgewicht',
          features: ['Sichtbares Volumen', 'Ausgewogene Form', 'Hält 3-4 Monate', '✓ Top-Seller'],
          featured: true
        },
        {
          name: 'Ultimate Fuller',
          amount: '€699',
          description: '1.5 mL - Maximum Confidence',
          features: ['Dramatisches Volumen', 'Luxe Lippen-Look', 'Hält 4-6 Monate']
        }
      ]
    },
    {
      type: 'faq',
      title: 'Häufig gestellte Fragen',
      items: [
        {
          question: 'Wird es schmerzhaft sein?',
          answer: 'Nein. Wir verwenden ein topisches Anästhetikum und eine feine Kanüle. Die meisten Patienten berichten von minimalen Unbehagen – eher ein leichtes Druckgefühl.'
        },
        {
          question: 'Wie lange halten die Ergebnisse?',
          answer: 'Typischerweise 3-4 Monate mit Hyaluronsäure. Bei regelmäßiger Wartung (2-3x pro Jahr) erhalten viele Patienten langfristige Ergebnisse.'
        },
        {
          question: 'Wird es Blutergüsse oder Schwellungen geben?',
          answer: 'Minimal. Mit unserer Kanülen-Technik reduzieren wir Blutergüsse um ~80%. Kleine Schwellungen sind normal für 24-48 Stunden.'
        },
        {
          question: 'Was, wenn ich es nicht mag?',
          answer: 'Das ist reversibel. Hyaluronsäure kann mit einem Enzym aufgelöst werden. Außerdem bieten wir kostenlose Anpassungen für 30 Tage an.'
        },
        {
          question: 'Können das Anfänger machen?',
          answer: 'Absolut. Wir empfehlen oft mit 0.5mL (Subtle Hydration) anzufangen und nach 2 Wochen zu sehen, wie du dich fühlst.'
        },
        {
          question: 'Ist Virtual Consultation wirklich kostenlos?',
          answer: 'Ja, 100% kostenlos. Der Arzt wird deine Lippen online analysieren, Optionen besprechen und alle Fragen beantworten.'
        }
      ]
    },
    {
      type: 'guarantee',
      title: 'Deine Zufriedenheit ist garantiert',
      subtitle: '30-Tage Zufriedenheitsgarantie',
      icon: '🛡️',
      description: 'Du bist nicht 100% begeistert? Kostenlose Überarbeitung oder Geld zurück.',
      items: [
        '✓ Kostenlose Folge-Termine (bis du zufrieden bist)',
        '✓ Filler kann ohne Kosten aufgelöst werden',
        '✓ 24/7 Support für alle Fragen',
        '✓ Transparent: Was du zahlst, ist was du bekommst'
      ]
    }
  ],

  booking: {
    title: 'Dein nächster Schritt: Kostenlose Beratung',
    subtitle: 'Limitierte Verfügbarkeit: Nur 3 Plätze pro Monat'
  },

  seo: {
    title: 'Lippenaufpolsterung | Natürliche Ergebnisse | My Health & Beauty',
    description: 'Professionelle Lippenaufpolsterung mit natürlichen Ergebnissen. Board-zertifizierte Ärzte, transparente Preise, Zufriedenheitsgarantie.',
    keywords: 'Lippenaufpolsterung, Lip Filler, Lippen vergrößern, Hyaluronsäure'
  }
};

// Set page data (from Strapi or mock)
page.value = mockPageData;

// Build breadcrumb
breadcrumbItems.value = [
  { label: 'Home', to: '/' },
  { label: 'Behandlungen', to: '/behandlungen' },
  { label: page.value?.treatment, to: null }
];

// Set SEO
seo.value = page.value?.seo;

// Set page meta
useHead({
  title: seo.value?.title,
  meta: [
    { name: 'description', content: seo.value?.description },
    { name: 'keywords', content: seo.value?.keywords },
    { property: 'og:title', content: seo.value?.title },
    { property: 'og:description', content: seo.value?.description },
    { property: 'og:type', content: 'website' }
  ]
});

// Schema.org
const config = useRuntimeConfig();
const schema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  name: `My Health & Beauty - ${page.value?.treatment}`,
  url: `${config.public.publicUrl}/general-pages/${pageSlug}`,
  medicalSpecialty: 'AestheticSurgery',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1250'
  }
};

useSchemaOrg(schema);

// Analytics
const trackEvent = (eventName: string, props = {}) => {
  if (typeof gtag !== 'undefined') {
    gtag.event(eventName, {
      page_type: 'general-page',
      treatment: page.value?.treatment,
      ...props
    });
  }
};

onMounted(() => {
  trackEvent('page_view', { page_slug: pageSlug });
});

// Personas for form
const personasForForm = [
  { key: 'claire', label: 'CLAIRE' },
  { key: 'regina', label: 'REGINA' },
  { key: 'bella', label: 'BELLA' },
  { key: 'teresa', label: 'TERESA' }
];
</script>

<style scoped lang="scss">
// Import same color variables from PAGE 1
$color-primary: #D4A574;
$color-secondary: #8B6F47;
$color-accent: #E8424F;
$color-bg: #F5F1ED;
$color-dark: #2C2C2C;
$color-gray: #757575;

.general-page {
  width: 100%;
}

// Hero Section
.hero {
  background: linear-gradient(135deg, $color-primary 0%, $color-secondary 100%);
  padding: 60px 20px;
  color: white;

  .hero-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    max-width: 1200px;
    margin: 0 auto;
    align-items: center;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 30px;
    }
  }

  .hero-headline {
    font-size: 48px;
    font-weight: bold;
    margin-bottom: 16px;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 32px;
    }
  }

  .hero-subheadline {
    font-size: 20px;
    margin-bottom: 24px;
    opacity: 0.95;
  }

  .hero-trust {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 32px;

    .trust-badge {
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .btn {
    padding: 16px 32px;
    border-radius: 4px;
    font-size: 16px;
    font-weight: bold;
    text-decoration: none;
    display: inline-block;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;

    &.btn-primary {
      background: $color-accent;
      color: white;

      &:hover {
        background: darken($color-accent, 10%);
        box-shadow: 0 4px 12px rgba($color-accent, 0.3);
      }
    }
  }

  .hero-image {
    img {
      width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
  }
}

// Sections
section {
  padding: 60px 20px;

  @media (max-width: 768px) {
    padding: 40px 20px;
  }

  h2 {
    font-size: 36px;
    color: $color-dark;
    margin-bottom: 40px;
    text-align: center;
    font-weight: bold;

    @media (max-width: 768px) {
      font-size: 24px;
      margin-bottom: 30px;
    }
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

// Gallery Grid
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;

  .gallery-item {
    border-radius: 8px;
    overflow: hidden;
    background: white;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .gallery-label {
      padding: 16px;
      font-size: 14px;
      font-weight: 500;
      color: $color-secondary;
      text-align: center;
    }
  }
}

// Video Section
.section-video {
  background: $color-bg;

  .video-container {
    margin-bottom: 24px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

    iframe {
      display: block;
    }
  }

  .video-description {
    text-align: center;
    color: $color-gray;
    font-size: 14px;
  }
}

// Testimonials Grid
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

// Benefits Grid
.benefits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;

  .benefit-card {
    background: white;
    padding: 32px;
    border-radius: 8px;
    border-left: 4px solid $color-primary;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    .benefit-icon {
      font-size: 40px;
      margin-bottom: 16px;
    }

    h3 {
      font-size: 18px;
      margin-bottom: 12px;
      color: $color-dark;
    }

    p {
      color: $color-gray;
      line-height: 1.6;
    }
  }
}

// Pricing Cards
.pricing-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// FAQ Accordion
.faq-accordion {
  max-width: 800px;
  margin: 0 auto;
}

// Guarantee Section
.section-guarantee {
  background: linear-gradient(135deg, rgba($color-primary, 0.1) 0%, rgba($color-secondary, 0.1) 100%);

  .guarantee-content {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;

    .guarantee-icon {
      font-size: 60px;
      margin-bottom: 24px;
    }

    h3 {
      font-size: 28px;
      color: $color-dark;
      margin-bottom: 16px;
    }

    p {
      color: $color-gray;
      margin-bottom: 24px;
    }

    .guarantee-list {
      list-style: none;
      padding: 0;
      text-align: left;

      li {
        padding: 12px 0;
        color: $color-dark;
        display: flex;
        align-items: center;
        gap: 12px;
      }
    }
  }
}

// Booking Section
.section-booking {
  background: $color-bg;
  text-align: center;

  .cta-subtext {
    margin-top: 24px;
    color: $color-accent;
    font-weight: bold;
    font-size: 14px;
  }
}

// Ads Footer
.section-ads-footer {
  background: $color-primary;
  color: white;
  padding: 40px 20px;
  text-align: center;

  h2 {
    color: white;
    margin-bottom: 24px;
  }

  .btn {
    background: $color-accent;
    color: white;
    padding: 16px 48px;

    &:hover {
      background: darken($color-accent, 10%);
    }
  }
}

// Rich Text Content
.richtext-content {
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.8;
  color: $color-dark;

  p {
    margin-bottom: 16px;
  }

  h3 {
    margin-top: 32px;
    margin-bottom: 16px;
    color: $color-dark;
  }

  ul, ol {
    margin: 16px 0;
    padding-left: 24px;

    li {
      margin-bottom: 8px;
    }
  }
}
</style>
