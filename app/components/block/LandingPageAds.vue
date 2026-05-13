<template>
  <div class="landing-page-ads">
    <!-- Hero Section -->
    <LandingHeroBlock
      :headline="heroData.headline"
      :subheadline="heroData.subheadline"
      :cta-text="heroData.ctaText"
      :cta-link="heroData.ctaLink"
      :image="heroData.image"
      class="hero-section"
      @primary="() => { trackCtaClick('hero'); navigateTo(heroData.ctaLink); }"
    />

    <!-- Before/After Carousel -->
    <div class="before-after-section py-20">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-4 text-neutral-900">
          {{ t('landing.ads.beforeAfter.title') }}
        </h2>
        <p class="text-xl text-center text-neutral-600 mb-12">
          {{ t('landing.ads.beforeAfter.subtitle') }}
        </p>
        <BeforeAfterBlock :items="beforeAfterItems" />
      </div>
    </div>

    <!-- Social Proof / Testimonials -->
    <div class="testimonials-section py-20 bg-neutral-50">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-16 text-neutral-900">
          {{ t('landing.ads.testimonials.title') }}
        </h2>
        <LandingReviewsBlock
          :reviews="testimonials"
          :show-rating="true"
          :columns="3"
        />
      </div>
    </div>

    <!-- Process / 3-Step -->
    <div class="process-section py-20">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-4 text-neutral-900">
          {{ t('landing.ads.process.title') }}
        </h2>
        <p class="text-xl text-center text-neutral-600 mb-16">
          {{ t('landing.ads.process.subtitle') }}
        </p>
        <ProcessSteps :steps="processSteps" />
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="faq-section py-20 bg-neutral-50">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-16 text-neutral-900">
          {{ t('landing.ads.faq.title') }}
        </h2>
        <FaqAccordionBlock :items="faqItems" />
      </div>
    </div>

    <!-- Trust Signals -->
    <div class="trust-signals-section py-20">
      <div class="container mx-auto px-4">
        <TrustGrid :items="trustSignals" />
      </div>
    </div>

    <!-- CTA Bottom -->
    <FinalCtaBlock
      :headline="ctaData.headline"
      :description="ctaData.description"
      :cta-text="ctaData.ctaText"
      :cta-link="ctaData.ctaLink"
      class="cta-bottom"
    />

    <!-- Mobile Sticky CTA -->
    <MobileStickyCtaBlock
      :cta-text="ctaData.mobileCtaText"
      :cta-link="ctaData.ctaLink"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface HeroData {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  image: string;
}

interface BeforeAfterItem {
  before: string;
  after: string;
  title: string;
  description: string;
}

interface Testimonial {
  id: string;
  name: string;
  title: string;
  text: string;
  rating: number;
  image: string;
}

interface ProcessStep {
  number: number;
  title: string;
  description: string;
  icon?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface TrustSignal {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

interface CTAData {
  headline: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  mobileCtaText: string;
}

const { t } = useI18n();
const { trackCtaClick, trackDiscountOfferClick, trackFaqOpen, trackCarouselNavigate, trackBookingClick, trackPhoneClick } = useGoogleAnalytics();

// Hero Section Data (e.g., "Lippen aufspritzen Aachen")
const heroData = ref<HeroData>({
  headline: t('landing.ads.hero.headline') || 'Perfekte Lippen in einer Stunde',
  subheadline: t('landing.ads.hero.subheadline') || 'Natürliche und volle Lippen — sicher und ästhetisch',
  ctaText: 'Termin Buchen',
  ctaLink: '/termin-buchen',
  image: '[Real Hero Image Here - Lip Filler Result]',
});

// Before/After Carousel Items
const beforeAfterItems = ref<BeforeAfterItem[]>([
  {
    before: '[Before Image 1]',
    after: '[After Image 1]',
    title: 'Lippen-Volumen',
    description: 'Subtile und natürliche Steigerung des Lippenvolumens',
  },
  {
    before: '[Before Image 2]',
    after: '[After Image 2]',
    title: 'Lippenkontur',
    description: 'Klare Kontur und Symmetrie',
  },
  {
    before: '[Before Image 3]',
    after: '[After Image 3]',
    title: 'Lippenform',
    description: 'Optimale Formgebung für Ihren Gesichtstyp',
  },
]);

// Testimonials
const testimonials = ref<Testimonial[]>([
  {
    id: '1',
    name: 'Sarah M.',
    title: 'Patientin seit 2023',
    text: 'Das Ergebnis ist fantastisch! Ich fühle mich viel selbstbewusster und die Lippen sehen absolut natürlich aus.',
    rating: 5,
    image: '[Patient Image 1]',
  },
  {
    id: '2',
    name: 'Julia L.',
    title: 'Patientin seit 2024',
    text: 'Das Team war professionell und kompetent. Keine Schmerzen, nur Ergebnis. Kann ich nur weiterempfehlen!',
    rating: 5,
    image: '[Patient Image 2]',
  },
  {
    id: '3',
    name: 'Anna K.',
    title: 'Regelmäßige Patientin',
    text: 'Meine Lippen haben eine neue Dimension bekommen. Der Doktor versteht sein Handwerk perfekt.',
    rating: 5,
    image: '[Patient Image 3]',
  },
  {
    id: '4',
    name: 'Lisa B.',
    title: 'Patientin seit 2023',
    text: 'Ich war nervös, aber der Prozess war schnell und das Ergebnis übertrifft meine Erwartungen.',
    rating: 5,
    image: '[Patient Image 4]',
  },
]);

// 3-Step Process
const processSteps = ref<ProcessStep[]>([
  {
    number: 1,
    title: 'Beratung',
    description: 'Kostenlose Konsultation mit unserem Facharzt. Wir besprechen Ihre Wünsche und gestalten den Plan.',
    icon: '👨‍⚕️',
  },
  {
    number: 2,
    title: 'Behandlung',
    description: 'Sichere und schmerzarme Behandlung mit Premium-Materialien. Nur 15-20 Minuten.',
    icon: '💉',
  },
  {
    number: 3,
    title: 'Ergebnis',
    description: 'Natürliches Ergebnis, das sich in den Tagen nach der Behandlung vollständig offenbart.',
    icon: '✨',
  },
]);

// FAQ Items
const faqItems = ref<FAQ[]>([
  {
    id: '1',
    question: 'Tut die Behandlung weh?',
    answer: 'Nein. Wir verwenden eine spezielle Betäubung und feine Nadeln. Die meisten Patienten empfinden nur leichte Druckempfindungen.',
  },
  {
    id: '2',
    question: 'Wie lange halten die Ergebnisse?',
    answer: 'Lippenunterspritzungen halten in der Regel 6-12 Monate, abhängig vom Material und Ihrem Stoffwechsel.',
  },
  {
    id: '3',
    question: 'Gibt es Ausfallzeiten?',
    answer: 'Minimal. Sie können sofort nach der Behandlung wieder zur Arbeit gehen. Leichte Schwellungen klingen in 24-48 Stunden ab.',
  },
  {
    id: '4',
    question: 'Welche Materialien verwenden Sie?',
    answer: 'Wir arbeiten ausschließlich mit CE-zertifizierten, medizinischen Hyaluronsäure-Produkten von führenden Herstellern.',
  },
  {
    id: '5',
    question: 'Ist die Behandlung sicher?',
    answer: 'Ja. Wir folgen internationalen Sicherheitsstandards und haben Ärzte mit 10+ Jahren Erfahrung.',
  },
  {
    id: '6',
    question: 'Wie viel kostet die Behandlung?',
    answer: 'Die Kosten beginnen bei €250 und hängen von Ihren individuellen Wünschen ab. Erste Beratung ist kostenlos.',
  },
]);

// Trust Signals
const trustSignals = ref<TrustSignal[]>([
  {
    title: '15+ Jahre Erfahrung',
    description: 'Ärzte mit umfassender ästhetischer Erfahrung',
    icon: '🏆',
  },
  {
    title: 'CE-Zertifiziert',
    description: 'Alle Materialien sind medizinisch zertifiziert',
    icon: '✓',
  },
  {
    title: '100% Hygiene',
    description: 'Klinik-Standard Desinfektionsprozesse',
    icon: '🔬',
  },
  {
    title: '5000+ Zufriedene Patienten',
    description: 'Durchschnittliche Bewertung: 4.8/5 Sternen',
    icon: '⭐',
  },
]);

// Final CTA
const ctaData = ref<CTAData>({
  headline: 'Bereit für eine Veränderung?',
  description: 'Buchen Sie heute eine kostenlose Konsultation. Keine versteckten Gebühren, nur ehrliche Beratung.',
  ctaText: 'Jetzt Termin Buchen',
  ctaLink: '/termin-buchen',
  mobileCtaText: 'Termin Buchen',
});
</script>

<style scoped>
.landing-page-ads {
  @apply w-full;
}

.hero-section {
  @apply mb-0;
}

.before-after-section {
  @apply scroll-mt-16;
}

.testimonials-section {
  @apply scroll-mt-16;
}

.process-section {
  @apply scroll-mt-16;
}

.faq-section {
  @apply scroll-mt-16;
}

.trust-signals-section {
  @apply scroll-mt-16;
}

.cta-bottom {
  @apply scroll-mt-16;
}

@media (max-width: 768px) {
  .landing-page-ads {
    @apply px-4;
  }
}
</style>
