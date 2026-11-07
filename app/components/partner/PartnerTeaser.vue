<template>
  <UiLayoutSectionBlock v-if="locale === 'de'">
    <aside class="partnerTeaser" aria-label="Partnerprogramm für Ärzte">
      <div>
        <p class="partnerTeaser__eyebrow">Für Ärzte</p>
        <h2 class="partnerTeaser__titel">Lieber eine eigene Praxis?</h2>
        <p class="partnerTeaser__text">
          Eröffne deine eigene Praxis für ästhetische Medizin als Partner von MY HEALTH & BEAUTY.
          Marke, Website, Software und Einkauf kommen fertig von uns.
        </p>
      </div>
      <NuxtLink to="/partnerpraxis" class="partnerTeaser__knopf" @click="klick">Partnerprogramm ansehen</NuxtLink>
    </aside>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
// Hinweis auf das Partnerprogramm (E32, #435) auf den Karriere-Seiten:
// Aerzte, die sich bewerben wollen, sollen auch den Weg in die eigene Praxis
// sehen. Nur Deutsch, wie die Partnerseite.
const { locale } = useI18n();
const { trackEvent } = useGoogleAnalytics();
const route = useRoute();
function klick() {
  trackEvent("partner_cta_click", { event_category: "engagement", position: `karriere:${route.path}` });
}
</script>

<style scoped>
.partnerTeaser {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 28px 32px;
  border-radius: 20px;
  background: #f6efe9;
  margin: 24px 0;
}
.partnerTeaser__eyebrow { margin: 0 0 4px; font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; }
.partnerTeaser__titel { margin: 0 0 8px; }
.partnerTeaser__text { margin: 0; max-width: 620px; line-height: 1.6; }
.partnerTeaser__knopf {
  display: inline-block;
  padding: 14px 24px;
  border-radius: 999px;
  background: #1d1d1b;
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  white-space: nowrap;
}
@media (max-width: 600px) {
  .partnerTeaser { padding: 22px 18px; }
  .partnerTeaser__knopf { width: 100%; text-align: center; white-space: normal; }
}
</style>
