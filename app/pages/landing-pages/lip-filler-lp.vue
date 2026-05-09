<template>
  <!-- Hero Section -->
  <section class="hero">
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-headline">{{ currentPersona.headline }}</h1>
        <p class="hero-subheadline">{{ currentPersona.subheadline }}</p>
        <div class="hero-trust">
          <span class="trust-badge">✓ 1000+ zufriedene Patienten</span>
          <span class="trust-badge">✓ Board-zertifizierte Ärzte</span>
        </div>
        <NuxtLink to="#booking" class="btn btn-primary">
          Kostenlose Beratung buchen
        </NuxtLink>
      </div>
      <div class="hero-image">
        <img 
          src="@/assets/images/lip-filler-hero.jpg" 
          alt="Natürliche Lippenaufpolsterung Vorher-Nachher"
          loading="lazy"
        />
      </div>
    </div>
  </section>

  <!-- Before/After Gallery (Competitor Gap #1) -->
  <section class="section-before-after">
    <div class="container">
      <h2>Natürliche Ergebnisse – Echte Patienten</h2>
      <div class="gallery-grid">
        <div v-for="(before, index) in beforeAfterGallery" :key="index" class="gallery-item">
          <LPBeforeAfterSlider 
            :before="before.before"
            :after="before.after"
            :alt="before.label"
          />
          <p class="gallery-label">{{ before.label }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Video Section (Competitor Gap #3) -->
  <section class="section-video">
    <div class="container">
      <h2>So funktioniert Lippenaufpolsterung</h2>
      <div class="video-container">
        <iframe 
          width="100%" 
          height="600" 
          src="https://www.youtube.com/embed/qKIJyK7wVrA" 
          title="Natural Lip Filler Results"
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowfullscreen>
        </iframe>
      </div>
      <p class="video-description">
        Dr. Jon Mendelsohn zeigt echte Patienten-Transformationen mit natürlichen, ausgewogenen Ergebnissen.
      </p>
    </div>
  </section>

  <!-- Social Proof Section -->
  <section class="section-social-proof">
    <div class="container">
      <h2>Was unsere Patienten sagen</h2>
      <div class="testimonials-grid">
        <LPTestimonialCard 
          v-for="testimonial in testimonials" 
          :key="testimonial.id"
          :name="testimonial.name"
          :age="testimonial.age"
          :text="testimonial.text"
          :rating="testimonial.rating"
          :avatar="testimonial.avatar"
        />
      </div>
    </div>
  </section>

  <!-- Benefits Section -->
  <section class="section-benefits">
    <div class="container">
      <h2>Warum Lippen Aufpolsterung?</h2>
      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="benefit-icon">💋</div>
          <h3>Volle, definierte Lippen</h3>
          <p>Natürliche Volumensteigerung für mehr Ausstrahlung und Jugendlichkeit.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">⚡</div>
          <h3>Schnell & unkompliziert</h3>
          <p>Nur 15-30 Minuten. Walk-in, walk-out. Arbeits- und sozialfähig sofort.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">🎯</div>
          <h3>Natürliche Ergebnisse</h3>
          <p>Kein "Fake-Look". Wir stärken deine Lippen genau richtig.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">🛡️</div>
          <h3>Sicher & reversibel</h3>
          <p>Hyaluronsäure-Filler. Körperverträglich. Kann bei Bedarf aufgelöst werden.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">💰</div>
          <h3>Flexible Finanzierung</h3>
          <p>Zahlungsplan ab €49/Monat. Keine versteckten Kosten.</p>
        </div>
        <div class="benefit-card">
          <div class="benefit-icon">📞</div>
          <h3>Virtual Consultation</h3>
          <p>Online-Beratung mit dem Arzt. Kostenlos. Unverbindlich.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Transparent Pricing (Competitor Gap #2) -->
  <section class="section-pricing">
    <div class="container">
      <h2>Klare Preise – Keine Überraschungen</h2>
      <div class="pricing-cards">
        <LPPricingCard 
          name="Subtle Hydration"
          amount="€299"
          description="0.5 mL - Perfekt für erste Mal"
          features="['Hauch von Volumen', 'Natürlicher Look', 'Hält 3-4 Monate']"
          cta="Beratung buchen"
        />
        <LPPricingCard 
          name="Full Volume (Beliebtest)"
          amount="€499"
          description="1 mL - Perfektes Gleichgewicht"
          features="['Sichtbares Volumen', 'Ausgewogene Form', 'Hält 3-4 Monate', '✓ Top-Seller']"
          cta="Beratung buchen"
          featured
        />
        <LPPricingCard 
          name="Ultimate Fuller"
          amount="€699"
          description="1.5 mL - Maximum Confidence"
          features="['Dramatisches Volumen', 'Luxe Lippen-Look', 'Hält 4-6 Monate']"
          cta="Beratung buchen"
        />
      </div>
      <p class="pricing-note">
        💳 Finanzierung: €49/Monat verfügbar | 🎁 Erste Beratung kostenlos
      </p>
    </div>
  </section>

  <!-- FAQ Section -->
  <section class="section-faq">
    <div class="container">
      <h2>Häufig gestellte Fragen</h2>
      <div class="faq-accordion">
        <LPFAQItem 
          v-for="(item, index) in faqItems"
          :key="index"
          :question="item.question"
          :answer="item.answer"
        />
      </div>
    </div>
  </section>

  <!-- Risk Reversal Section (Competitor Gap #4) -->
  <section class="section-guarantee">
    <div class="container">
      <h2>Deine Zufriedenheit ist garantiert</h2>
      <div class="guarantee-content">
        <div class="guarantee-icon">🛡️</div>
        <h3>30-Tage Zufriedenheitsgarantie</h3>
        <p>Du bist nicht 100% begeistert? Kostenlose Überarbeitung oder Geld zurück.</p>
        <ul class="guarantee-list">
          <li>✓ Kostenlose Folge-Termine (bis du zufrieden bist)</li>
          <li>✓ Filler kann ohne Kosten aufgelöst werden</li>
          <li>✓ 24/7 Support für alle Fragen</li>
          <li>✓ Transparent: Was du zahlst, ist was du bekommst</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section id="booking" class="section-booking">
    <div class="container">
      <h2>Dein nächster Schritt: Kostenlose Beratung</h2>
      <LPBookingForm 
        :treatment="'Lippenaufpolsterung'"
        :personas="personasForForm"
      />
      <p class="cta-subtext">
        Limitierte Verfügbarkeit: Nur {{ availableSlots }} Plätze pro Monat
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';

// Personas with different messaging angles
const personas = {
  claire: {
    headline: 'Stop feinen Linien. Starten Sie die Prävention.',
    subheadline: 'Volle Lippen jetzt = Keine teuren Operationen später',
    calloutangle: 'prevention'
  },
  regina: {
    headline: 'Strahlende Lippen. Volle Ausstrahlung.',
    subheadline: 'Sehen Sie aus wie Sie sich fühlen – revitalisiert & wach',
    calloutangle: 'confidence'
  },
  bella: {
    headline: 'Sichtbare Transformation. In 48 Stunden.',
    subheadline: 'Volle Lippen. Natürlich. Jetzt.',
    calloutangle: 'results'
  },
  teresa: {
    headline: 'Natürliche Schönheit. Sicher & nachhaltig.',
    subheadline: 'Wellness, die deine innere Vitalität widerspiegelt',
    calloutangle: 'wellness'
  }
};

// Default to Regina (balanced persona for general audience)
const currentPersona = ref(personas.regina);

// Get persona from URL query param (for A/B testing later)
const route = useRoute();
onMounted(() => {
  const personaParam = route.query.persona as string;
  if (personaParam && personas[personaParam as keyof typeof personas]) {
    currentPersona.value = personas[personaParam as keyof typeof personas];
  }
});

// Before/After Gallery Data
const beforeAfterGallery = [
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
  },
];

// Testimonials (age-diverse for all personas)
const testimonials = [
  {
    id: 1,
    name: 'Claire S.',
    age: 32,
    text: 'Ich war nervös, aber die Ärzte haben mich sofort beruhigt. Meine Lippen sehen natürlich aus – nicht "gemacht". Meine Kolleginnen haben nichts bemerkt, aber mein Freund sagt, ich sehe glücklicher aus!',
    rating: 5,
    avatar: '/avatars/claire.jpg'
  },
  {
    id: 2,
    name: 'Regina M.',
    age: 48,
    text: 'Nach meiner Scheidung wollte ich mich wieder jung fühlen. Das ist nicht dramatisch, aber ich FÜHLE den Unterschied. Ich sehe wieder "mich" aus.',
    rating: 5,
    avatar: '/avatars/regina.jpg'
  },
  {
    id: 3,
    name: 'Bella L.',
    age: 26,
    text: 'Definitionen sind alles! Meine Lippen sind jetzt ein echtes Statement. Und ja, ich habe ein Before-After auf Instagram gepostet – meine Follower sind obsessed!',
    rating: 5,
    avatar: '/avatars/bella.jpg'
  },
  {
    id: 4,
    name: 'Teresa K.',
    age: 52,
    text: 'Ich war skeptisch zu Anfang, aber die Beratung war sehr wissenschaftlich. Hyaluronsäure ist in meinem Körper natürlich. Ich fühle mich jetzt authentischer.',
    rating: 5,
    avatar: '/avatars/teresa.jpg'
  },
];

// FAQ Items
const faqItems = [
  {
    question: 'Wird es schmerzhaft sein?',
    answer: 'Nein. Wir verwenden ein topisches Anästhetikum und eine feine Kanüle. Die meisten Patienten berichten von minimalen Unbehagen – eher ein leichtes Druckgefühl. Das war es schon.'
  },
  {
    question: 'Wie lange halten die Ergebnisse?',
    answer: 'Typischerweise 3-4 Monate mit Hyaluronsäure. Bei regelmäßiger Wartung (2-3x pro Jahr) erhalten viele Patienten langfristige Ergebnisse. Die genaue Dauer hängt von Stoffwechsel, Lebensstil und Fillermenge ab.'
  },
  {
    question: 'Wird es Blutergüsse oder Schwellungen geben?',
    answer: 'Minimal. Mit unserer Kanülen-Technik reduzieren wir Blutergüsse um ~80%. Kleine Schwellungen sind normal für 24-48 Stunden. Du kannst sofort arbeiten oder ausgehen – niemand wird es bemerken.'
  },
  {
    question: 'Was, wenn ich es nicht mag?',
    answer: 'Das ist reversibel. Hyaluronsäure kann mit einem Enzym aufgelöst werden. Außerdem bieten wir kostenlose Anpassungen für 30 Tage an. Wir werden es so lange optimieren, bis du begeistert bist – oder Geld zurück.'
  },
  {
    question: 'Können das Anfänger machen?',
    answer: 'Absolut. Wir empfehlen oft mit 0.5mL (Subtle Hydration) anzufangen und nach 2 Wochen zu sehen, wie du dich fühlst. Du kannst immer später mehr hinzufügen.'
  },
  {
    question: 'Ist Virtual Consultation wirklich kostenlos?',
    answer: 'Ja, 100% kostenlos. Der Arzt wird deine Lippen online analysieren, Optionen besprechng und alle Fragen beantworten. Keine Verpflichtung zu buchen – echt unverbindlich.'
  }
];

// Personas for booking form (for multi-variant testing later)
const personasForForm = Object.entries(personas).map(([key, value]) => ({
  key,
  label: key.toUpperCase()
}));

// Available slots simulation
const availableSlots = ref(3);

// SEO Meta Tags
});

// Schema.org structured data
const schema = {
  '@context': 'https://schema.org',
  '@type': 'MedicalBusiness',
  name: 'My Health & Beauty - Lippenaufpolsterung',
  url: 'https://www.myhealthandbeauty.com/landing-pages/lip-filler-lp',
  medicalSpecialty: 'AestheticSurgery',
  areaServed: [
    'DE', 'AT', 'CH'
  ],
  priceRange: '€299 - €699',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '1250'
  }
};


// Analytics Event Tracking

onMounted(() => {
  trackEvent('page_view', { page: 'lip-filler-lp' });
});
</script>

<style scoped lang="scss">
// Colors from design system
$color-primary: #D4A574;    // Gold
$color-secondary: #8B6F47;  // Bronze
$color-accent: #E8424F;     // Red CTA
$color-bg: #F5F1ED;         // Warm off-white
$color-dark: #2C2C2C;       // Dark
$color-gray: #757575;       // Gray

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

// Standard Section
.section-before-after,
.section-video,
.section-social-proof,
.section-benefits,
.section-pricing,
.section-faq,
.section-guarantee,
.section-booking {
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

// Social Proof
.section-social-proof {
  background: white;

  .testimonials-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
  }
}

// Benefits Grid
.section-benefits {
  background: $color-bg;

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
}

// Pricing Cards
.section-pricing {
  background: white;

  .pricing-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 32px;
    margin-bottom: 32px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  .pricing-note {
    text-align: center;
    color: $color-gray;
    font-size: 14px;
  }
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

// FAQ Accordion
.faq-accordion {
  max-width: 800px;
  margin: 0 auto;
}
</style>
