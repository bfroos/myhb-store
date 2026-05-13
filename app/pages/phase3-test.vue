<template>
  <div class="test-page">
    <h1>Phase 3 Components Test</h1>
    
    <section class="test-section">
      <h2>CommunityCardsBlock Component</h2>
      <CommunityCardsBlock
        heading="Join Our Community"
        :cards="[
          {
            icon: '💬',
            title: 'Discord',
            members: '2K+',
            description: 'Real-time chat, support & tips',
            cta: { text: 'Join Now', link: 'https://discord.gg/example' }
          },
          {
            icon: '📷',
            title: 'Instagram',
            members: '50K+',
            description: 'Daily tips & user features',
            cta: { text: 'Follow', link: '@myhb_beauty' }
          },
          {
            icon: '🎬',
            title: 'TikTok',
            members: '100K+',
            description: 'Viral transformations & trends',
            cta: { text: 'Follow', link: '@myhb_beauty' }
          },
          {
            icon: '📧',
            title: 'Newsletter',
            description: 'Weekly skincare tips',
            cta: { text: 'Subscribe', link: '#newsletter' }
          }
        ]"
      />
    </section>

    <section class="test-section">
      <h2>QuizComponent Test</h2>
      <QuizComponent
        :questions="[
          {
            id: '1',
            question: 'Was ist dein Hauttyp?',
            options: [
              { label: 'Trocken', value: 'dry' },
              { label: 'Ölig', value: 'oily' },
              { label: 'Kombiniert', value: 'combo' },
              { label: 'Normal', value: 'normal' }
            ]
          },
          {
            id: '2',
            question: 'Welches ist dein Hauptproblem?',
            options: [
              { label: 'Falten & Feuchtigkeitsmangel', value: 'wrinkles' },
              { label: 'Volumen & Elastizität', value: 'volume' },
              { label: 'Pigmentierung & Flecken', value: 'pigmentation' },
              { label: 'Allgemeine Hautgesundheit', value: 'overall' }
            ]
          },
          {
            id: '3',
            question: 'Wie ernst ist das Problem?',
            options: [
              { label: 'Leicht - Minimale Bedenken', value: 'light' },
              { label: 'Moderat - Merkbar aber unkritisch', value: 'moderate' },
              { label: 'Schwer - Ein großes Anliegen', value: 'severe' }
            ]
          }
        ]"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default'
});
</script>

<style scoped>
.test-page {
  max-width: 1920px;
  margin: 0 auto;
  padding: 20px;
  background: #f5f5f5;
}

h1 {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 40px;
  text-align: center;
}

.test-section {
  background: white;
  border-radius: 8px;
  padding: 40px 20px;
  margin-bottom: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 30px;
}
</style>
