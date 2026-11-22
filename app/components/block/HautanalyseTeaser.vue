<template>
  <!-- myhb-os#1445: Startseiten-Teaser der kostenlosen Hautanalyse, bebildert
       (Benjamin 30.10.2026: Text plus Knopf war zu lieblos). Die Chips nennen
       nur, WAS die Analyse anschaut, keine Ergebnisse und keine Behandlung (HWG). -->
  <UiLayoutSectionBlock spacing="sibling">
    <section class="ha-teaser" data-track-placement="hautanalyse_cta">
      <figure class="ha-teaser__media">
        <img
          class="ha-teaser__img"
          :src="BILD.large"
          :srcset="`${BILD.large} 800w, ${BILD.original} 1600w`"
          sizes="(min-width: 900px) 50vw, 100vw"
          width="800"
          height="533"
          loading="lazy"
          decoding="async"
          alt="Frau macht ein Selfie mit dem Handy"
        />
        <span class="ha-teaser__frame" aria-hidden="true">
          <span class="ha-teaser__scan" />
        </span>
        <ul class="ha-teaser__chips" aria-label="Was die Analyse anschaut">
          <li v-for="chip in CHIPS" :key="chip">{{ chip }}</li>
        </ul>
      </figure>

      <div class="ha-teaser__body">
        <p class="ha-teaser__kicker">Neu · kostenlos</p>
        <h2 class="ha-teaser__title">Deine Hautanalyse per Selfie</h2>
        <ol class="ha-teaser__steps">
          <li><strong>Selfie machen</strong> in unserer App</li>
          <li><strong>Hautbild sehen</strong> in rund 30 Sekunden</li>
          <li><strong>Besprechen</strong> in einer kostenlosen Beratung mit einem Arzt</li>
        </ol>
        <UiAtomBaseButton
          class="ha-teaser__cta"
          as="a"
          :href="href"
          variant="secondary"
          size="lg"
        >
          Kostenlose Hautanalyse starten
        </UiAtomBaseButton>
        <p class="ha-teaser__hint">
          Mit kostenlosem Konto. KI-gestützt, ersetzt keine ärztliche Untersuchung.
        </p>
      </div>
    </section>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
import { hautanalyseDeeplink } from "#shared/hautanalyseCta";

/** Strapi-Mediathek, Datei 876 (Selfie-Motiv). */
const BILD = {
  large:
    "https://media.myhealthandbeauty.app/large_attractive_young_woman_holding_camera_stretched_hand_taking_selfie_making_her_photo_mobile_phone_smiling_standing_white_background_1_1f47acbb21.webp",
  original:
    "https://media.myhealthandbeauty.app/attractive_young_woman_holding_camera_stretched_hand_taking_selfie_making_her_photo_mobile_phone_smiling_standing_white_background_1_1f47acbb21.webp",
};
const CHIPS = ["Linien", "Feuchtigkeit", "Poren", "Hautbild"];

const href = hautanalyseDeeplink("startseite", "startseite");
</script>

<style scoped>
.ha-teaser {
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;
  background: var(--color-gray-950, #0b0b0b);
  color: var(--color-white, #fff);
  border-radius: var(--border-radius-card, 24px);
}
@media (min-width: 900px) {
  .ha-teaser {
    grid-template-columns: 1.05fr 1fr;
  }
}

.ha-teaser__media {
  position: relative;
  /* Festes Seitenverhaeltnis wie das Foto: kein Zuschnitt, der Rahmen sitzt
     dadurch bei jeder Breite auf dem Gesicht. */
  align-self: center;
  margin: 0;
  aspect-ratio: 3 / 2;
  background: var(--color-gray-100, #f2f2f2);
}
.ha-teaser__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Scan-Rahmen ums Gesicht: vier Ecken plus eine langsam laufende Linie. */
.ha-teaser__frame {
  position: absolute;
  left: 45%;
  top: 12%;
  width: 28%;
  height: 60%;
  --ecke: 22px;
  background:
    linear-gradient(#fff, #fff) left top / var(--ecke) 2px,
    linear-gradient(#fff, #fff) left top / 2px var(--ecke),
    linear-gradient(#fff, #fff) right top / var(--ecke) 2px,
    linear-gradient(#fff, #fff) right top / 2px var(--ecke),
    linear-gradient(#fff, #fff) left bottom / var(--ecke) 2px,
    linear-gradient(#fff, #fff) left bottom / 2px var(--ecke),
    linear-gradient(#fff, #fff) right bottom / var(--ecke) 2px,
    linear-gradient(#fff, #fff) right bottom / 2px var(--ecke);
  background-repeat: no-repeat;
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.35));
  overflow: hidden;
}
.ha-teaser__scan {
  position: absolute;
  left: 6%;
  right: 6%;
  top: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent);
  animation: ha-scan 3.2s ease-in-out infinite alternate;
}
@keyframes ha-scan {
  from { top: 8%; }
  to { top: 92%; }
}
@media (prefers-reduced-motion: reduce) {
  .ha-teaser__scan { animation: none; top: 50%; }
}

.ha-teaser__chips {
  position: absolute;
  left: var(--space-300);
  right: var(--space-300);
  bottom: var(--space-300);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-100);
  margin: 0;
  padding: 0;
  list-style: none;
}
.ha-teaser__chips li {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(6px);
  color: var(--color-gray-900, #111);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  line-height: 1.4;
  white-space: nowrap;
}
@media (min-width: 600px) {
  .ha-teaser__chips {
    left: var(--space-400);
    bottom: var(--space-400);
    gap: var(--space-200);
  }
  .ha-teaser__chips li {
    padding: 6px 12px;
    font-size: var(--font-sm);
  }
}

.ha-teaser__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: var(--space-400);
  padding: var(--space-card-pad);
}
@media (min-width: 900px) {
  .ha-teaser__body {
    gap: var(--space-500);
  }
}
.ha-teaser__kicker {
  margin: 0;
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-gray-300, #ccc);
}
.ha-teaser__title {
  margin: 0;
  font-size: var(--font-xl);
  font-weight: var(--font-bold);
  line-height: 1.15;
  hyphens: manual;
  overflow-wrap: normal;
}
@media (min-width: 600px) {
  .ha-teaser__title {
    font-size: var(--font-2xl);
  }
}
@media (min-width: 900px) {
  .ha-teaser__title {
    font-size: var(--font-3xl);
  }
}
.ha-teaser__steps {
  display: grid;
  gap: var(--space-300);
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: schritt;
}
.ha-teaser__steps li {
  position: relative;
  padding-left: 2.25rem;
  line-height: 1.5;
  color: var(--color-gray-200, #e5e5e5);
  counter-increment: schritt;
}
.ha-teaser__steps li::before {
  content: counter(schritt);
  position: absolute;
  left: 0;
  top: 0.1em;
  display: grid;
  place-items: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.55);
  color: var(--color-white, #fff);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
}
.ha-teaser__steps strong {
  color: var(--color-white, #fff);
}
/* Heller Knopf auf Schwarz statt Grau; auf dem Handy volle Breite. */
.ha-teaser__cta {
  --button-secondary-color-bg: var(--color-white, #fff);
  --button-secondary-color-bg-hover: var(--color-gray-200, #e5e5e5);
  --button-secondary-color-text: var(--color-black, #000);
  width: 100%;
  margin-top: var(--space-200);
}
@media (min-width: 600px) {
  .ha-teaser__cta {
    width: auto;
  }
}
.ha-teaser__hint {
  margin: 0;
  font-size: var(--font-xs);
  color: var(--color-gray-400, #999);
}
</style>
