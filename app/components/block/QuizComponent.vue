<template>
  <div class="quiz-component">
    <div v-if="currentStep < questions.length" class="quiz-step">
      <div class="step-indicator mb-4 sm:mb-8">
        <div class="flex items-center justify-between mb-2">
          <span class="text-xs sm:text-sm font-semibold text-neutral-600">
            Frage {{ currentStep + 1 }} von {{ questions.length }}
          </span>
          <span class="text-xs sm:text-sm text-neutral-500">
            {{ Math.round(((currentStep + 1) / questions.length) * 100) }}%
          </span>
        </div>
        <div class="w-full bg-neutral-200 rounded-full h-2" role="progressbar" :aria-valuenow="Math.round(((currentStep + 1) / questions.length) * 100)" aria-valuemin="0" aria-valuemax="100">
          <div
            class="bg-pink-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: `${((currentStep + 1) / questions.length) * 100}%` }"
          />
        </div>
      </div>

      <h3 class="text-xl sm:text-2xl font-bold text-neutral-900 mb-4 sm:mb-6 break-words">
        {{ questions[currentStep].question }}
      </h3>

      <div class="space-y-3" role="group" :aria-label="`Question ${currentStep + 1}`">
        <button
          v-for="option in questions[currentStep].options"
          :key="option.value"
          class="w-full p-3 sm:p-4 text-left border-2 rounded-lg transition font-medium min-h-14 sm:min-h-16 flex items-center"
          :class="
            answers[questions[currentStep].id] === option.value
              ? 'border-pink-500 bg-pink-50 text-pink-900'
              : 'border-neutral-200 bg-white text-neutral-700 hover:border-pink-300'
          "
          :aria-pressed="answers[questions[currentStep].id] === option.value"
          @click="selectAnswer(questions[currentStep].id, option.value)"
        >
          <span class="flex items-center gap-3 w-full">
            <span
              class="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              :class="
                answers[questions[currentStep].id] === option.value
                  ? 'border-pink-500 bg-pink-500'
                  : 'border-neutral-300'
              "
              aria-hidden="true"
            >
              <span
                v-if="answers[questions[currentStep].id] === option.value"
                class="text-white text-xs sm:text-sm font-bold"
              >
                ✓
              </span>
            </span>
            <span class="break-words">{{ option.label }}</span>
          </span>
        </button>
      </div>

      <div class="flex gap-2 sm:gap-4 mt-6 sm:mt-8">
        <button
          v-if="currentStep > 0"
          class="flex-1 px-3 sm:px-4 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-50 transition text-sm sm:text-base min-h-12"
          @click="previousStep"
        >
          Zurück
        </button>
        <button
          class="flex-1 px-3 sm:px-4 py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base min-h-12"
          :disabled="!answers[questions[currentStep].id]"
          @click="nextStep"
        >
          {{ currentStep === questions.length - 1 ? 'Fertig' : 'Weiter' }}
        </button>
      </div>
    </div>

    <div v-else class="quiz-result">
      <div class="text-center mb-6 sm:mb-8">
        <div class="text-5xl sm:text-6xl mb-3 sm:mb-4">🎉</div>
        <h3 class="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
          Danke für deine Antworten!
        </h3>
        <p class="text-sm sm:text-base text-neutral-600 break-words">
          Wir haben eine personalisierte Behandlungsempfehlung für dich.
        </p>
      </div>

      <div class="bg-pink-50 border border-pink-200 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <p class="text-sm sm:text-base text-neutral-700">
          Basierend auf deine Antworten empfehlen wir dir:
        </p>
        <p class="text-lg sm:text-xl font-bold text-pink-600 mt-2 break-words">
          {{ recommendedTreatment }}
        </p>
        <p class="text-xs sm:text-sm text-neutral-600 mt-2">
          Diese Behandlung passt perfekt zu deinen Zielen und deinem Hauttyp.
        </p>
      </div>

      <div class="space-y-3 sm:space-y-4">
        <button
          class="w-full px-4 sm:px-6 py-3 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-lg transition text-sm sm:text-base min-h-12"
          @click="navigateTo('/termin-buchen')"
        >
          Termin für Konsultation buchen
        </button>
        <button
          class="w-full px-4 sm:px-6 py-3 border border-neutral-300 text-neutral-700 font-bold rounded-lg hover:bg-neutral-50 transition text-sm sm:text-base min-h-12"
          @click="resetQuiz"
        >
          Quiz erneut machen
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{ label: string; value: string }>;
}

interface Props {
  questions: QuizQuestion[];
}

defineProps<Props>();
const emit = defineEmits<{ complete: [answers: Record<string, string>] }>();

const currentStep = ref(0);
const answers = ref<Record<string, string>>({});

const recommendedTreatment = computed(() => {
  const skinType = answers.value['1'] || '';
  const concern = answers.value['2'] || '';

  const treatments: Record<string, Record<string, string>> = {
    dry: {
      wrinkles: 'Hyaluronsäure Skin Booster + Microneedling',
      volume: 'Wangen Filler + Skin Hydration',
      pigmentation: 'Laser Pigmentation + Hydration Boost',
      overall: 'Glow Treatment - Komplettes Wellness Paket',
    },
    oily: {
      wrinkles: 'Botox + Pore Minimizing',
      volume: 'Subtile Filler mit Pore Control',
      pigmentation: 'Laser Behandlung für klare Haut',
      overall: 'Deep Cleansing + Light Filler',
    },
    combo: {
      wrinkles: 'Botox mit gezielten Filler',
      volume: 'Balanced Filler Approach',
      pigmentation: 'Lasertherapie mit Hydration',
      overall: 'Balanced Beauty Treatment',
    },
    normal: {
      wrinkles: 'Preventive Botox + Collagen Boost',
      volume: 'Light Enhancement mit Filler',
      pigmentation: 'Radiance Boost Treatment',
      overall: 'Maintenance & Glow Package',
    },
  };

  return treatments[skinType]?.[concern] || 'Personalisierte Konsultation';
});

const selectAnswer = (questionId: string, value: string) => {
  answers.value[questionId] = value;
};

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++;
  } else {
    emit('complete', answers.value);
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const resetQuiz = () => {
  currentStep.value = 0;
  answers.value = {};
};
</script>

<style scoped>
.quiz-component {
  @apply w-full;
}

.quiz-step {
  @apply bg-white p-4 sm:p-6 md:p-8 rounded-lg;
}

.quiz-result {
  @apply bg-white p-4 sm:p-6 md:p-8 rounded-lg;
}

/* Ensure touch targets are minimum 48x48px for WCAG compliance */
button {
  @apply touch-manipulation;
}
</style>
