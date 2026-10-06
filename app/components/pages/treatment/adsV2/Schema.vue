<template>
  <!-- Wirkanimation (Parya/Zelgai 05.10.2026, Benjamin 06.10.2026): ein
       Hautschnitt in drei Phasen, im selben Takt wie die Schrittliste
       darunter. Ersetzt die Strichgesichter. Bewusst ohne Nadel. -->
  <figure class="v2-schema">
    <div class="v2-schema__stage">
      <svg v-if="variant === 'profhilo'" class="v2-schema__skin" viewBox="0 0 420 280" role="img" :aria-label="copy.aria">
        <defs>
          <linearGradient :id="id('derm')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#eadbd3" />
            <stop offset="1" stop-color="#e2cfc5" />
          </linearGradient>
          <linearGradient :id="id('sub')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#f4ead8" />
            <stop offset="1" stop-color="#efe2ca" />
          </linearGradient>
          <radialGradient :id="id('ha')">
            <stop offset="0" stop-color="#fff" stop-opacity="0.95" />
            <stop offset="0.55" stop-color="#fff" stop-opacity="0.55" />
            <stop offset="1" stop-color="#fff" stop-opacity="0" />
          </radialGradient>
          <linearGradient :id="id('band')" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="#fff" stop-opacity="0" />
            <stop offset="0.5" stop-color="#fff" stop-opacity="0.7" />
            <stop offset="1" stop-color="#fff" stop-opacity="0" />
          </linearGradient>
        </defs>
        <rect x="0" y="62" width="420" height="132" :fill="`url(#${id('derm')})`" />
        <rect x="0" y="192" width="420" height="88" :fill="`url(#${id('sub')})`" />
        <g class="v2-schema__fat">
          <circle cx="40" cy="226" r="20" /><circle cx="92" cy="240" r="24" /><circle cx="150" cy="222" r="19" />
          <circle cx="204" cy="244" r="23" /><circle cx="262" cy="224" r="20" /><circle cx="318" cy="242" r="24" />
          <circle cx="376" cy="224" r="19" /><circle cx="20" cy="268" r="14" /><circle cx="400" cy="268" r="14" />
        </g>
        <g class="v2-schema__fib v2-schema__fib--slack">
          <path d="M0 92c30 14 50-14 80 0s50 14 80 0 50-14 80 0 50 14 80 0 50-14 100 0" />
          <path d="M0 132c30-14 50 14 80 0s50-14 80 0 50 14 80 0 50-14 80 0 50 14 100 0" />
          <path d="M0 170c30 12 50-12 80 0s50 12 80 0 50-12 80 0 50 12 80 0 50-12 100 0" />
        </g>
        <g class="v2-schema__fib v2-schema__fib--firm">
          <path d="M0 90c70 5 140-5 210 0s140 5 210 0" />
          <path d="M0 130c70-5 140 5 210 0s140-5 210 0" />
          <path d="M0 168c70 5 140-5 210 0s140 5 210 0" />
        </g>
        <rect class="v2-schema__band" x="0" y="104" width="420" height="96" :fill="`url(#${id('band')})`" />
        <!-- Injektionsebene laut IBSA-Anwendung (BAP-Technik): Bolus in
             die tiefe Lederhaut / obere Unterhaut, verteilt sich von dort -->
        <line class="v2-schema__plane" x1="0" y1="192" x2="420" y2="192" />
        <text x="406" y="184" text-anchor="end" class="v2-schema__lbl v2-schema__lbl--plane">Hier wird injiziert</text>
        <ellipse v-for="x in [90, 210, 330]" :key="x" class="v2-schema__drop" :cx="x" cy="192" rx="22" ry="22" :fill="`url(#${id('ha')})`" />
        <path class="v2-schema__surf v2-schema__surf--old" d="M0 44c30 0 44-3 62-2l8 16 8-16c40-2 70 2 100 0l9 18 9-18c50-2 80 2 100 0l8 14 8-14c40-2 72 2 108 0v22H0z" />
        <path class="v2-schema__surf v2-schema__surf--new" d="M0 40c100-5 320-5 420 0v26H0z" />
        <text x="14" y="58" class="v2-schema__lbl">Oberhaut</text>
        <text x="14" y="86" class="v2-schema__lbl v2-schema__lbl--in">Lederhaut</text>
        <text x="14" y="212" class="v2-schema__lbl v2-schema__lbl--in">Unterhaut</text>
      </svg>
      <!-- Muskelrelaxans: Wirkstoff in den Muskel, der Muskel entspannt sich,
           die Falte darueber glaettet sich -->
      <svg v-else-if="variant === 'muskel'" class="v2-schema__skin" viewBox="0 0 420 280" role="img" :aria-label="copy.aria">
      <defs>
        <linearGradient :id="id('derm')" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#eadbd3" />
          <stop offset="1" stop-color="#e2cfc5" />
        </linearGradient>
        <linearGradient :id="id('sub')" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f4ead8" />
          <stop offset="1" stop-color="#efe2ca" />
        </linearGradient>
        <linearGradient :id="id('mus')" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#d9a99e" />
          <stop offset="1" stop-color="#c99488" />
        </linearGradient>
        <radialGradient :id="id('ha')">
          <stop offset="0" stop-color="#fff" stop-opacity="0.95" />
          <stop offset="0.55" stop-color="#fff" stop-opacity="0.55" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="62" width="420" height="92" :fill="`url(#${id('derm')})`" />
      <rect x="0" y="152" width="420" height="128" :fill="`url(#${id('sub')})`" />
      <path class="v2-schema__mus v2-schema__mus--tense" :fill="`url(#${id('mus')})`" d="M0 198c110 0 150-22 210-26 60 4 100 26 210 26v50c-110 0-150 22-210 26-60-4-100-26-210-26z" />
      <path v-if="zone === 'masseter'" class="v2-schema__mus v2-schema__mus--relaxed" :fill="`url(#${id('mus')})`" d="M0 204c140-3 280-3 420 0v38c-140 3-280 3-420 0z" />
      <path v-else class="v2-schema__mus v2-schema__mus--relaxed" :fill="`url(#${id('mus')})`" d="M0 196c140-3 280-3 420 0v54c-140 3-280 3-420 0z" />
      <g class="v2-schema__mfib v2-schema__mfib--tense">
        <path d="M30 212c60 0 110-16 180-20 70 4 120 20 180 20" />
        <path d="M30 228c60 0 110-10 180-12 70 2 120 12 180 12" />
        <path d="M30 244c60 0 110 6 180 8 70-2 120-6 180-8" />
      </g>
      <g class="v2-schema__mfib v2-schema__mfib--relaxed">
        <path d="M30 210h360" /><path d="M30 223h360" /><path d="M30 236h360" />
      </g>
      <ellipse v-for="x in [172, 248]" :key="x" class="v2-schema__dot" :cx="x" cy="220" rx="18" ry="14" :fill="`url(#${id('ha')})`" />
      <!-- Masseter: keine Falte, der Muskel wird schmaler -->
      <template v-if="zone !== 'masseter'">
        <path class="v2-schema__surf v2-schema__surf--old" d="M0 42c80 0 140-2 186 0l24 40 24-40c46-2 106 0 186 0V66H234l-24 40-24-40H0z" />
        <path class="v2-schema__surf v2-schema__surf--new" d="M0 40c100-5 320-5 420 0v26H0z" />
      </template>
      <path v-else class="v2-schema__surf v2-schema__surf--static" d="M0 40c100-5 320-5 420 0v26H0z" />
      <text x="14" y="58" class="v2-schema__lbl">Oberhaut</text>
      <text x="14" y="104" class="v2-schema__lbl v2-schema__lbl--in">Lederhaut</text>
      <text x="14" y="176" class="v2-schema__lbl v2-schema__lbl--in">Unterhaut</text>
      <text x="14" y="229" class="v2-schema__lbl v2-schema__lbl--mus">{{ copy.muscle }}</text>
      <text x="406" y="178" text-anchor="end" class="v2-schema__lbl v2-schema__lbl--plane v2-schema__lbl--sub">Hier wird injiziert ↓</text>
    </svg>
      <!-- Hyaluron: Depot unter der Falte bzw. in der Zone, polstert von unten -->
      <svg v-else-if="variant === 'hyaluron'" class="v2-schema__skin" viewBox="0 0 420 280" role="img" :aria-label="copy.aria">
      <defs>
        <linearGradient :id="id('derm')" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#eadbd3" />
          <stop offset="1" stop-color="#e2cfc5" />
        </linearGradient>
        <linearGradient :id="id('sub')" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#f4ead8" />
          <stop offset="1" stop-color="#efe2ca" />
        </linearGradient>
        <linearGradient :id="id('mus')" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#d9a99e" />
          <stop offset="1" stop-color="#c99488" />
        </linearGradient>
        <radialGradient :id="id('ha')">
          <stop offset="0" stop-color="#fff" stop-opacity="0.95" />
          <stop offset="0.55" stop-color="#fff" stop-opacity="0.55" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect x="0" y="62" width="420" height="92" :fill="`url(#${id('derm')})`" />
      <rect x="0" y="152" width="420" height="128" :fill="`url(#${id('sub')})`" />
      <g class="v2-schema__fat">
        <circle cx="40" cy="226" r="20" /><circle cx="92" cy="246" r="24" /><circle cx="330" cy="244" r="23" />
        <circle cx="384" cy="222" r="19" /><circle cx="22" cy="270" r="14" /><circle cx="400" cy="270" r="14" />
      </g>
      <g class="v2-schema__fib v2-schema__fib--slack">
        <path d="M0 92c30 14 50-14 80 0s50 14 80 0 50-14 80 0 50 14 80 0 50-14 100 0" />
        <path d="M0 128c30-14 50 14 80 0s50-14 80 0 50 14 80 0 50-14 80 0 50 14 100 0" />
      </g>
      <g class="v2-schema__fib v2-schema__fib--firm">
        <path d="M0 90c70 5 140-5 210 0s140 5 210 0" />
        <path d="M0 126c70-5 140 5 210 0s140-5 210 0" />
      </g>
      <ellipse class="v2-schema__filler" cx="210" cy="164" rx="70" ry="30" :fill="`url(#${id('ha')})`" />
      <path class="v2-schema__surf v2-schema__surf--old" d="M0 42c80 0 140-2 180 0l30 46 30-46c40-2 100 0 180 0V66H240l-30 46-30-46H0z" />
      <path class="v2-schema__surf v2-schema__surf--new" d="M0 40c100-5 320-5 420 0v26H0z" />
      <text x="14" y="58" class="v2-schema__lbl">Oberhaut</text>
      <text x="14" y="104" class="v2-schema__lbl v2-schema__lbl--in">Lederhaut</text>
      <text x="14" y="178" class="v2-schema__lbl v2-schema__lbl--in">Unterhaut</text>
      <text x="406" y="214" text-anchor="end" class="v2-schema__lbl v2-schema__lbl--plane v2-schema__lbl--sub">Hyaluron-Depot</text>
    </svg>
    </div>
    <ol class="v2-schema__steps">
      <li v-for="(step, i) in copy.steps" :key="i"><span>{{ i + 1 }}</span>{{ step }}</li>
    </ol>
    <figcaption>Schematische Darstellung</figcaption>
  </figure>
</template>

<script setup lang="ts">
const props = defineProps<{
  variant: "profhilo" | "muskel" | "hyaluron";
  zone?: string | null;
}>();

// Eindeutige Verlaufs-IDs je Instanz (SVG-IDs gelten seitenweit).
const uid = useId();
const id = (name: string) => `v2s-${uid}-${name}`;

const copy = computed(() => {
  if (props.variant === "profhilo") {
    return {
      aria: "Hautschnitt: Profhilo verteilt sich in der Lederhaut",
      muscle: "",
      steps: [
        "Kleine Depots an 5 Punkten je Gesichtshälfte, in die tiefe Lederhaut",
        "Von dort verteilt sich das Hyaluron gleichmäßig in der Haut",
        "Mehr Feuchtigkeit – die Haut kann straffer und frischer wirken",
      ],
    };
  }
  if (props.variant === "muskel") {
    const kau = props.zone === "masseter";
    const lip = props.zone === "lipflip";
    return {
      aria: "Hautschnitt: Der Wirkstoff entspannt den Muskel unter der Haut",
      muscle: kau ? "Kaumuskel" : "Muskel",
      steps: [
        kau
          ? "Wenige feine Injektionen in den Kaumuskel"
          : "Wenige feine Injektionen in den Muskel, der die Falte macht",
        "Der Muskel entspannt sich innerhalb weniger Tage",
        kau
          ? "Der Kaumuskel wird entlastet und kann schmaler wirken"
          : lip
            ? "Die Oberlippe rollt sich leicht nach außen und wirkt voller"
            : "Die Haut darüber wirkt glatter – deine Mimik bleibt",
      ],
    };
  }
  return {
    aria: "Hautschnitt: Hyaluron polstert die Stelle von unten",
    muscle: "",
    steps: [
      "Feine Hyaluron-Depots gezielt dort, wo Volumen fehlt",
      "Das Hyaluron bindet Feuchtigkeit und polstert von innen",
      "Die Stelle wirkt sanft aufgefüllt",
    ],
  };
});
</script>

<style scoped>
.v2-schema {
  --v2s-t: 8s;
  margin: 0 0 var(--space-500);
  padding: var(--space-400);
  border-radius: var(--border-radius-500, 24px);
  background: var(--color-card-bg-soft, #f2f1ef);
  color: #0d0d0e;
}

.v2-schema__stage {
  max-width: 560px;
  margin: 0 auto;
}

.v2-schema svg {
  display: block;
  width: 100%;
  height: auto;
}

.v2-schema__skin {
  border-radius: 14px;
  overflow: hidden;
  background: #fbf8f6;
}

.v2-schema__fat circle {
  fill: rgba(255, 255, 255, 0.35);
  stroke: rgba(205, 180, 140, 0.55);
  stroke-width: 1.2;
}

.v2-schema__fib path {
  fill: none;
  stroke: rgba(255, 255, 255, 0.75);
  stroke-width: 2;
  stroke-linecap: round;
}

.v2-schema__fib--slack { animation: v2s-out var(--v2s-t) ease-in-out infinite; }
.v2-schema__fib--firm { opacity: 0; animation: v2s-in var(--v2s-t) ease-in-out infinite; }
.v2-schema__surf--old { fill: #f1e4dc; animation: v2s-out var(--v2s-t) ease-in-out infinite; }
.v2-schema__surf--new { fill: #f6ebe4; opacity: 0; animation: v2s-in var(--v2s-t) ease-in-out infinite; }

.v2-schema__band {
  opacity: 0;
  animation: v2s-band var(--v2s-t) ease-in-out infinite;
}

.v2-schema__drop {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: v2s-drop var(--v2s-t) ease-out infinite;
}

.v2-schema__lbl {
  font-size: 15px;
  font-weight: 500;
  fill: #646368;
}

.v2-schema__lbl--in {
  fill: #46454a;
}

.v2-schema__lbl--plane {
  font-weight: 600;
  fill: #0d0d0e;
  paint-order: stroke;
  stroke: #e2cfc5;
  stroke-width: 6px;
  stroke-linejoin: round;
}

.v2-schema__plane {
  stroke: #0d0d0e;
  stroke-width: 1.5;
  stroke-dasharray: 5 5;
}

.v2-schema__steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-300);
  margin: var(--space-400) 0 0;
  padding: 0;
  list-style: none;
}

.v2-schema__steps li {
  display: flex;
  gap: var(--space-200);
  align-items: flex-start;
  font-size: var(--font-sm);
  line-height: 1.35;
  color: #9e9da2;
  animation: v2s-step var(--v2s-t) ease-in-out infinite;
}

.v2-schema__steps li:nth-child(2) { animation-delay: calc(var(--v2s-t) / -3 * 2); }
.v2-schema__steps li:nth-child(3) { animation-delay: calc(var(--v2s-t) / -3); }

.v2-schema__steps span {
  flex: none;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid currentColor;
  font-size: 12px;
  font-weight: 600;
}

@media (max-width: 599px) {
  .v2-schema__steps {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-200);
  }
}

@media (max-width: 479px) {
  .v2-schema {
    padding: var(--space-300);
  }

}

.v2-schema figcaption {
  margin-top: var(--space-200);
  font-size: var(--font-xs);
  color: var(--color-text-light);
  text-align: right;
}

/* Takt: 0-33 % Depots setzen, 33-66 % verteilen, 66-100 % Wirkung */
@keyframes v2s-drop {
  0%, 6% { opacity: 0; transform: scale(0.2); }
  16% { opacity: 1; transform: scale(0.7); }
  33% { opacity: 1; transform: scale(1); }
  58% { opacity: 0.9; transform: translateY(-40px) scale(3.2, 1.7); }
  72%, 100% { opacity: 0; transform: translateY(-48px) scale(3.8, 1.9); }
}

@keyframes v2s-band {
  0%, 42% { opacity: 0; }
  64%, 90% { opacity: 1; }
  98%, 100% { opacity: 0; }
}

@keyframes v2s-out {
  0%, 64% { opacity: 1; }
  78%, 90% { opacity: 0; }
  98%, 100% { opacity: 1; }
}

@keyframes v2s-in {
  0%, 64% { opacity: 0; }
  78%, 90% { opacity: 1; }
  98%, 100% { opacity: 0; }
}

@keyframes v2s-step {
  0%, 31% { color: #0d0d0e; }
  35%, 98% { color: #9e9da2; }
  100% { color: #0d0d0e; }
}

@media (prefers-reduced-motion: reduce) {
  .v2-schema *,
  .v2-schema__steps li {
    animation: none !important;
  }

  .v2-schema__band,
  .v2-schema__fib--firm,
  .v2-schema__surf--new {
    opacity: 1;
  }

  .v2-schema__fib--slack,
  .v2-schema__surf--old {
    opacity: 0;
  }

  .v2-schema__steps li {
    color: #0d0d0e;
  }
}

.v2-schema__surf--static {
  fill: #f1e4dc;
}

.v2-schema__lbl--sub {
  stroke: #f3e8d6;
}

.v2-schema__lbl--mus {
  fill: #fff;
  font-weight: 600;
  paint-order: stroke;
  stroke: #cf9d92;
  stroke-width: 6px;
  stroke-linejoin: round;
}

/* Muskelrelaxans: Muskel angespannt -> entspannt (33-55 %) */
.v2-schema__mus--tense,
.v2-schema__mfib--tense {
  animation: v2s-mout var(--v2s-t) ease-in-out infinite;
}

.v2-schema__mus--relaxed,
.v2-schema__mfib--relaxed {
  opacity: 0;
  animation: v2s-min var(--v2s-t) ease-in-out infinite;
}

.v2-schema__mfib path {
  fill: none;
  stroke: rgba(255, 255, 255, 0.55);
  stroke-width: 1.6;
  stroke-linecap: round;
}

.v2-schema__dot {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: v2s-dot var(--v2s-t) ease-out infinite;
}

/* Hyaluron: Depot waechst und bleibt */
.v2-schema__filler {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  animation: v2s-fill var(--v2s-t) ease-out infinite;
}

@keyframes v2s-mout {
  0%, 36% { opacity: 1; }
  54%, 90% { opacity: 0; }
  98%, 100% { opacity: 1; }
}

@keyframes v2s-min {
  0%, 36% { opacity: 0; }
  54%, 90% { opacity: 1; }
  98%, 100% { opacity: 0; }
}

@keyframes v2s-dot {
  0%, 6% { opacity: 0; transform: scale(0.2); }
  16%, 34% { opacity: 1; transform: scale(1); }
  52%, 100% { opacity: 0; transform: scale(1.6); }
}

@keyframes v2s-fill {
  0%, 6% { opacity: 0; transform: scale(0.15); }
  20% { opacity: 1; transform: scale(0.45); }
  58%, 92% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .v2-schema__mus--relaxed,
  .v2-schema__mfib--relaxed,
  .v2-schema__filler {
    opacity: 1;
  }

  .v2-schema__mus--tense,
  .v2-schema__mfib--tense,
  .v2-schema__dot {
    opacity: 0;
  }
}
</style>
