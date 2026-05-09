<template>
  <div class="landing-page-social">
    <!-- Hook Section (Lifestyle Image + Short Benefit) -->
    <div class="hook-section relative h-screen flex items-center justify-center">
      <div class="absolute inset-0">
        <img
          src="[Instagram Lifestyle Image - Real Transformation]"
          alt="Lifestyle transformation"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black/30" />
      </div>
      <div class="relative z-10 text-center text-white px-4">
        <h1 class="text-5xl font-bold mb-4">
          {{ t('landing.social.hook.headline') || 'Fühle dich selbstbewusster' }}
        </h1>
        <p class="text-2xl mb-8 font-light">
          {{ t('landing.social.hook.benefit') || 'In einer Stunde. Natürlich. Sicher.' }}
        </p>
        <button
          class="px-8 py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg transition"
          @click="scrollToQuiz"
        >
          Entdecke Dein Hautziel
        </button>
      </div>
    </div>

    <!-- Quiz Section (Lead Magnet) -->
    <div
      ref="quizRef"
      class="quiz-section py-20 bg-white"
    >
      <div class="container mx-auto px-4 max-w-2xl">
        <h2 class="text-4xl font-bold text-center mb-4 text-neutral-900">
          {{ t('landing.social.quiz.title') || 'Was ist dein Hauttyp?' }}
        </h2>
        <p class="text-center text-neutral-600 mb-12">
          {{ t('landing.social.quiz.subtitle') || 'Finde heraus, welche Behandlung zu dir passt.' }}
        </p>
        <QuizComponent :questions="quizQuestions" @complete="handleQuizComplete" />
        <div class="mt-8 p-6 bg-pink-50 rounded-lg border border-pink-200">
          <p class="text-sm text-neutral-600">
            📥 Kostenlos: Personalisierte Behandlungsempfehlung per Email
          </p>
        </div>
      </div>
    </div>

    <!-- Results Showcase (Before/After Grid) -->
    <div class="results-section py-20 bg-neutral-50">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-4 text-neutral-900">
          {{ t('landing.social.results.title') || 'Echte Transformationen' }}
        </h2>
        <p class="text-center text-neutral-600 mb-16">
          {{ t('landing.social.results.subtitle') || 'Von echten Patienten wie Dir' }}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="result in resultsShowcase"
            :key="result.id"
            class="result-card group cursor-pointer"
          >
            <div class="relative overflow-hidden rounded-lg h-96">
              <img
                :src="result.beforeImage"
                alt="Before"
                class="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition" />
              <span class="absolute top-4 left-4 bg-white text-neutral-900 px-3 py-1 rounded-full text-sm font-semibold">
                Vorher
              </span>
            </div>
            <div class="mt-2">
              <p class="text-sm font-medium text-neutral-600">{{ result.treatment }}</p>
              <p class="text-xs text-neutral-500">{{ result.patient }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Influencer Testimonials (Community Feel) -->
    <div class="influencer-section py-20 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-4xl font-bold text-center mb-16 text-neutral-900">
          {{ t('landing.social.influencers.title') || 'Was sagen unsere Patienten?' }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            v-for="testimonial in influencerTestimonials"
            :key="testimonial.id"
            class="testimonial-card p-8 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-pink-300 transition"
          >
            <div class="flex items-start gap-4">
              <img
                :src="testimonial.image"
                :alt="testimonial.name"
                class="w-16 h-16 rounded-full object-cover"
              />
              <div class="flex-1">
                <div class="flex items-center gap-1 mb-2">
                  <span v-for="i in 5" :key="i" class="text-yellow-400">★</span>
                </div>
                <p class="font-bold text-neutral-900">{{ testimonial.name }}</p>
                <p class="text-sm text-neutral-600 mb-4">@{{ testimonial.handle }}</p>
                <blockquote class="text-neutral-700 italic">
                  "{{ testimonial.quote }}"
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Community Section -->
    <div class="community-section py-20 bg-gradient-to-r from-pink-50 to-purple-50">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-4xl font-bold mb-4 text-neutral-900">
          {{ t('landing.social.community.title') || 'Tritt unserer Community bei' }}
        </h2>
        <p class="text-xl text-neutral-600 mb-8">
          {{ t('landing.social.community.subtitle') || 'Über 5.000 zufriedene Patienten. Inspiriert. Unterstützt. Transformiert.' }}
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div class="stat-card">
            <p class="text-4xl font-bold text-pink-600">5,000+</p>
            <p class="text-neutral-600">Zufriedene Patienten</p>
          </div>
          <div class="stat-card">
            <p class="text-4xl font-bold text-pink-600">4.8⭐</p>
            <p class="text-neutral-600">Durchschnittliche Bewertung</p>
          </div>
          <div class="stat-card">
            <p class="text-4xl font-bold text-pink-600">98%</p>
            <p class="text-neutral-600">Würden weiterempfehlen</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Free Guide CTA -->
    <div class="guide-section py-20 bg-white">
      <div class="container mx-auto px-4 max-w-2xl">
        <div class="bg-neutral-900 text-white p-12 rounded-lg text-center">
          <h2 class="text-3xl font-bold mb-4">
            {{ t('landing.social.guide.title') || 'Kostenlos: Skincare Guide' }}
          </h2>
          <p class="mb-8 text-neutral-300">
            {{ t('landing.social.guide.subtitle') || 'Professionelle Tipps für strahlende Haut nach der Behandlung' }}
          </p>
          <form @submit.prevent="handleGuideSignup" class="space-y-4">
            <input
              v-model="guideEmail"
              type="email"
              placeholder="Deine Email"
              required
              class="w-full px-4 py-3 bg-white text-neutral-900 rounded-lg placeholder-neutral-500"
            />
            <button
              type="submit"
              class="w-full px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg transition"
            >
              Guide gratis downloaden
            </button>
          </form>
          <p class="text-xs text-neutral-400 mt-4">
            Wir respektieren deine Privatsphäre. Abmeldung jederzeit möglich.
          </p>
        </div>
      </div>
    </div>

    <!-- Limited Time Offer -->
    <div class="offer-section py-20 bg-red-50 border-t-4 border-red-500">
      <div class="container mx-auto px-4 text-center">
        <div class="animate-pulse mb-4">
          <span class="inline-block px-4 py-2 bg-red-500 text-white font-bold rounded-full">
            ⏰ Nur diese Woche!
          </span>
        </div>
        <h2 class="text-4xl font-bold mb-4 text-red-900">
          {{ t('landing.social.offer.title') || '15% Rabatt auf deine erste Behandlung' }}
        </h2>
        <p class="text-2xl text-red-700 mb-8 font-semibold">
          Code: <span class="bg-red-200 px-2 py-1 rounded">SOCIAL15</span>
        </p>
        <p class="text-neutral-600 mb-8">
          Gültig bis: Sonntag, 23:59 Uhr
        </p>
        <button
          class="px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition text-lg"
          @click="handlePromoBooking"
        >
          Jetzt buchen mit Rabatt
        </button>
      </div>
    </div>

    <!-- Mobile Sticky CTA (Always Visible) -->
    <MobileStickyCtaBlock
      cta-text="Termin buchen"
      cta-link="/termin-buchen"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{ label: string; value: string }>;
}

interface Result {
  id: string;
  beforeImage: string;
  treatment: string;
  patient: string;
}

interface Testimonial {
  id: string;
  name: string;
  handle: string;
  image: string;
  quote: string;
}

const { t } = useI18n();
const quizRef = ref<HTMLElement | null>(null);
const guideEmail = ref('');

// Quiz Questions (Lead Magnet)
const quizQuestions = ref<QuizQuestion[]>([
  {
    id: '1',
    question: 'Welcher Hauttyp bist du?',
    options: [
      { label: 'Trocken & sensibel', value: 'dry' },
      { label: 'Ölig & unrein', value: 'oily' },
      { label: 'Kombiniert', value: 'combo' },
      { label: 'Normal & gesund', value: 'normal' },
    ],
  },
  {
    id: '2',
    question: 'Welches ist dein Hautanliegen?',
    options: [
      { label: 'Falten & Linien', value: 'wrinkles' },
      { label: 'Volumen & Elastizität', value: 'volume' },
      { label: 'Pigmentierung', value: 'pigmentation' },
      { label: 'Gesamterscheinung', value: 'overall' },
    ],
  },
]);

// Before/After Showcase
const resultsShowcase = ref<Result[]>([
  {
    id: '1',
    beforeImage: '[Before Image 1 - Botox Zornesfalte]',
    treatment: 'Botox Zornesfalten',
    patient: 'Maria, 42',
  },
  {
    id: '2',
    beforeImage: '[Before Image 2 - Lipper Filler]',
    treatment: 'Lippen Filler',
    patient: 'Sophie, 28',
  },
  {
    id: '3',
    beforeImage: '[Before Image 3 - Under Eye]',
    treatment: 'Augenringe Behandlung',
    patient: 'Jennifer, 35',
  },
  {
    id: '4',
    beforeImage: '[Before Image 4 - Skin Booster]',
    treatment: 'Skin Booster',
    patient: 'Anna, 31',
  },
  {
    id: '5',
    beforeImage: '[Before Image 5 - Chin Augmentation]',
    treatment: 'Kinn Vergrößerung',
    patient: 'Lisa, 26',
  },
  {
    id: '6',
    beforeImage: '[Before Image 6 - Cheek Filler]',
    treatment: 'Wangen Filler',
    patient: 'Julia, 38',
  },
]);

// Influencer Testimonials
const influencerTestimonials = ref<Testimonial[]>([
  {
    id: '1',
    name: 'Sarah K.',
    handle: 'sarahskincare',
    image: '[Influencer Image 1]',
    quote: 'Ich bin obsessed! Die Lippen sehen natürlich aus und der Arzt war so professionell. Total empfohlen! 💗',
  },
  {
    id: '2',
    name: 'Lisa M.',
    handle: 'lisabeauty',
    image: '[Influencer Image 2]',
    quote: 'Endlich keine Zornesfalten mehr! Und die Kosten sind fair. Ich gehe wieder hin 100%.',
  },
  {
    id: '3',
    name: 'Julia L.',
    handle: 'juliaglow',
    image: '[Influencer Image 3]',
    quote: 'Das beste Geschenk, das ich mir selbst gemacht habe. Ich fühle mich wieder wie ich selbst!',
  },
  {
    id: '4',
    name: 'Emma T.',
    handle: 'emmastyle',
    image: '[Influencer Image 4]',
    quote: 'Keine Faustregel, nur echte Ästhetik. Der Arzt versteht sein Handwerk perfekt. 10/10 ⭐',
  },
]);

// Methods
const scrollToQuiz = () => {
  if (quizRef.value) {
    quizRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};

const handleQuizComplete = (answers: Record<string, string>) => {
  console.log('Quiz completed with answers:', answers);
  // Track in analytics
  if (window.gtag) {
    window.gtag('event', 'quiz_complete', { answers });
  }
};

const handleGuideSignup = async () => {
  if (!guideEmail.value) return;
  
  // TODO: Send to HubSpot or email service
  console.log('Guide signup:', guideEmail.value);
  alert('Danke! Der Guide wird in Kürze zu deiner Email versendet.');
  guideEmail.value = '';
};

const handlePromoBooking = () => {
  // Redirect with promo code
  navigateTo('/termin-buchen?promo=SOCIAL15');
};
</script>

<style scoped>
.landing-page-social {
  @apply w-full;
}

.hook-section {
  @apply -mt-16 pt-16; /* Offset header */
}

.quiz-section,
.results-section,
.influencer-section,
.community-section,
.guide-section,
.offer-section {
  @apply scroll-mt-16;
}

.stat-card {
  @apply p-6;
}

@media (max-width: 768px) {
  .hook-section h1 {
    @apply text-3xl;
  }

  .hook-section p {
    @apply text-lg;
  }
}
</style>
