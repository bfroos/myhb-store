<template>
  <section class="capture theme-light">
    <h2 class="capture__headline">Jetzt dein Selfie</h2>
    <ul class="capture__hints">
      <li>Gleichmäßiges Licht, am besten am Fenster</li>
      <li>Frontal in die Kamera, Haare aus dem Gesicht</li>
      <li>Ohne Make-up und ohne Brille</li>
    </ul>

    <div class="capture__stage">
      <video
        v-show="kameraLaeuft"
        ref="videoEl"
        class="capture__video"
        playsinline
        autoplay
        muted
      />
      <div v-if="!kameraLaeuft" class="capture__fallback">
        <p v-if="kameraFehler">{{ kameraFehler }}</p>
        <p v-else>Kamera wird geöffnet …</p>
      </div>
      <div v-if="kameraLaeuft" class="capture__guide" aria-hidden="true" />
    </div>

    <UiAtomBaseButton
      size="lg"
      full-width
      :disabled="!kameraLaeuft"
      @click="aufnehmen"
    >
      Foto aufnehmen
    </UiAtomBaseButton>

    <p class="capture__or">oder</p>
    <label class="capture__upload">
      <input type="file" accept="image/jpeg,image/png,image/webp" @change="ausDatei">
      <span>Foto vom Handy auswählen</span>
    </label>

    <p class="capture__note">
      Dein Foto wird nur für die Analyse verwendet und danach nicht gespeichert.
    </p>
  </section>
</template>

<script setup lang="ts">
/**
 * Aufnahme im Browser — ohne Anbieter-SDK (#136).
 *
 * Das ist die Stelle, an der die Vorbilder am wenigsten zaubern: Kalia Lab
 * nimmt mit `getUserMedia`, quadratisch, 1080 als Wunschgroesse auf und
 * schickt ein JPEG an den eigenen Server. Genau das steht hier. Ein
 * White-Label-Widget dafuer einzukaufen, waere die teuerste Art, zwanzig Zeilen
 * zu sparen.
 *
 * Der Upload-Weg ist kein Beiwerk: Auf dem iPad in der Lounge und ueberall, wo
 * die Kamerafreigabe scheitert, ist er der einzige Weg.
 */
const emit = defineEmits<{ captured: [bild: string] }>();

/** Zielkante des gesendeten Bildes. Mehr bringt keine bessere Messung, nur Bytes. */
const KANTE = 1080;

const videoEl = ref<HTMLVideoElement | null>(null);
const kameraLaeuft = ref(false);
const kameraFehler = ref("");
let strom: MediaStream | null = null;

onMounted(async () => {
  try {
    strom = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        aspectRatio: 1,
        width: { ideal: KANTE },
        height: { ideal: KANTE },
      },
    });
    if (!videoEl.value) return;
    videoEl.value.srcObject = strom;
    videoEl.value.onloadedmetadata = () => {
      kameraLaeuft.value = true;
    };
  } catch (fehler) {
    console.error("[hautanalyse] Kamera nicht verfügbar:", fehler);
    kameraFehler.value =
      "Wir kommen nicht an die Kamera. Du kannst stattdessen ein Foto auswählen.";
  }
});

onBeforeUnmount(() => {
  strom?.getTracks().forEach((spur) => spur.stop());
  strom = null;
});

/** Mittigen quadratischen Ausschnitt in ein JPEG zeichnen. */
function quadratischesJpeg(
  quelle: CanvasImageSource,
  breite: number,
  hoehe: number,
): string {
  const kante = Math.min(breite, hoehe);
  const leinwand = document.createElement("canvas");
  leinwand.width = KANTE;
  leinwand.height = KANTE;
  const ctx = leinwand.getContext("2d");
  if (!ctx) throw new Error("Kein 2D-Kontext");
  ctx.drawImage(
    quelle,
    (breite - kante) / 2,
    (hoehe - kante) / 2,
    kante,
    kante,
    0,
    0,
    KANTE,
    KANTE,
  );
  return leinwand.toDataURL("image/jpeg", 0.9);
}

function aufnehmen() {
  const video = videoEl.value;
  if (!video) return;
  emit(
    "captured",
    quadratischesJpeg(video, video.videoWidth, video.videoHeight),
  );
}

async function ausDatei(ereignis: Event) {
  const datei = (ereignis.target as HTMLInputElement).files?.[0];
  if (!datei) return;
  const bild = new Image();
  const url = URL.createObjectURL(datei);
  try {
    await new Promise<void>((fertig, fehlgeschlagen) => {
      bild.onload = () => fertig();
      bild.onerror = () => fehlgeschlagen(new Error("Bild nicht lesbar"));
      bild.src = url;
    });
    emit("captured", quadratischesJpeg(bild, bild.naturalWidth, bild.naturalHeight));
  } catch (fehler) {
    console.error("[hautanalyse] Datei nicht lesbar:", fehler);
    kameraFehler.value = "Dieses Bild konnten wir nicht lesen. Versuch ein anderes.";
  } finally {
    URL.revokeObjectURL(url);
  }
}
</script>

<style scoped>
.capture {
  max-width: var(--container-width-xs);
  margin: 0 auto;
  padding: var(--space-600) var(--container-pad-xs) var(--space-800);
  text-align: center;
}

.capture__headline {
  margin: 0 0 var(--space-300);
}

.capture__hints {
  display: grid;
  gap: var(--space-100);
  margin: 0 0 var(--space-400);
  font-size: var(--font-sm);
  color: var(--color-text-light);
}

.capture__stage {
  position: relative;
  aspect-ratio: 1;
  margin-bottom: var(--space-400);
  overflow: hidden;
  border-radius: var(--border-radius-400);
  background: var(--color-card-bg-neutral);
}

.capture__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Vorschau spiegeln, damit die Bewegung stimmt. Das gesendete Bild bleibt
     ungespiegelt — es wird aus dem Videostrom gezeichnet, nicht aus dem DOM. */
  transform: scaleX(-1);
}

.capture__fallback {
  display: grid;
  place-items: center;
  height: 100%;
  padding: var(--space-400);
  font-size: var(--font-sm);
  color: var(--color-text-muted);
}

.capture__guide {
  position: absolute;
  inset: 12% 22%;
  border: 2px dashed rgb(255 255 255 / 65%);
  border-radius: 50%;
  pointer-events: none;
}

.capture__or {
  margin: var(--space-300) 0;
  font-size: var(--font-sm);
  color: var(--color-text-muted);
}

.capture__upload input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.capture__upload span {
  display: inline-block;
  text-decoration: underline;
  cursor: pointer;
}

.capture__note {
  margin: var(--space-500) 0 0;
  font-size: var(--font-xs);
  color: var(--color-text-muted);
}
</style>
