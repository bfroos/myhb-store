<template>
  <div class="hautanalyse">
    <SkinanalysisIntro
      v-if="schritt === 'intro'"
      v-model:einwilligung="einwilligung"
      v-model:volljaehrig="volljaehrig"
      @start="starten"
    />

    <SkinanalysisCapture
      v-else-if="schritt === 'aufnahme'"
      @captured="analysieren"
    />

    <section v-else-if="schritt === 'laedt'" class="hautanalyse__loading theme-light">
      <h2>Wir schauen uns deine Haut an …</h2>
      <p>Das dauert ein paar Sekunden.</p>
    </section>

    <section v-else-if="schritt === 'fehler'" class="hautanalyse__error theme-light">
      <h2>Das hat nicht geklappt</h2>
      <p>{{ fehlertext }}</p>
      <UiAtomBaseButton size="lg" @click="schritt = 'aufnahme'">
        Noch einmal versuchen
      </UiAtomBaseButton>
    </section>

    <SkinanalysisResult
      v-else-if="schritt === 'ergebnis' && ergebnis"
      :ergebnis="ergebnis"
      :empfehlungen="empfehlungen"
      @restart="zuruecksetzen"
      @booking="buchungGeklickt"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Kostenlose Hautanalyse (bfroos/myhb-store#136, Epic E19 in elanagency/myhb-os).
 *
 * Vier Schritte auf einer Route: erklaeren und einwilligen, aufnehmen, messen
 * lassen, Ergebnis mit Empfehlungen. Kein Zwischenspeichern, kein Konto, keine
 * E-Mail-Huerde vor dem Ergebnis.
 *
 * Der Stand: Die Messung laeuft gegen den Stub-Anbieter (Beispielwerte), weil
 * fuer keinen echten Anbieter ein Auftragsverarbeitungsvertrag vorliegt und die
 * Rechtsfreigabe (#252) offen ist. Der Ablauf drumherum ist echt und
 * vollstaendig — genau dafuer ist der Stub da.
 *
 * Deshalb steht die Seite auch auf `noindex`: Ein Werkzeug, das Gesundheitsdaten
 * verarbeitet, soll nicht ueber die Suche gefunden werden, bevor Anwalt und
 * Anbieter geklaert sind. Die Zeile faellt weg, wenn #252 freigegeben ist.
 */
import {
  empfehlungenFuer,
  type Empfehlung,
  type HautanalyseErgebnis,
} from "#shared/hautanalyse";

type Schritt = "intro" | "aufnahme" | "laedt" | "ergebnis" | "fehler";

const schritt = ref<Schritt>("intro");
const einwilligung = ref(false);
const volljaehrig = ref(false);
const ergebnis = ref<HautanalyseErgebnis | null>(null);
const fehlertext = ref("");

const { trackEvent } = useGoogleAnalytics();

const empfehlungen = computed<Empfehlung[]>(() =>
  ergebnis.value ? empfehlungenFuer(ergebnis.value) : [],
);

useHead({
  title: "Kostenlose Hautanalyse | MY Health & Beauty",
  meta: [
    {
      name: "description",
      content:
        "Ein Selfie, ein Ergebnis in unter einer Minute: Sieh, woran deine Haut arbeitet – und was in einer kostenlosen Beratung Sinn ergibt.",
    },
    { name: "robots", content: "noindex, nofollow" },
  ],
});

function starten() {
  trackEvent("hautanalyse_consent", { event_category: "engagement" });
  schritt.value = "aufnahme";
}

async function analysieren(bild: string) {
  schritt.value = "laedt";
  trackEvent("hautanalyse_image", { event_category: "engagement" });
  try {
    ergebnis.value = await $fetch<HautanalyseErgebnis>("/api/hautanalyse/analyse", {
      method: "POST",
      body: {
        bild,
        einwilligung: einwilligung.value,
        volljaehrig: volljaehrig.value,
      },
    });
    schritt.value = "ergebnis";
    trackEvent("hautanalyse_result", {
      event_category: "engagement",
      // Nur Kennzahlen, keine Merkmalswerte: was die Haut der Nutzerin sagt,
      // geht Google nichts an.
      empfehlungen: empfehlungen.value.length,
    });
  } catch (fehler: unknown) {
    console.error("[hautanalyse] Analyse fehlgeschlagen:", fehler);
    fehlertext.value =
      (fehler as { statusMessage?: string })?.statusMessage ||
      "Die Analyse hat nicht geklappt. Bitte versuch es noch einmal.";
    schritt.value = "fehler";
  }
}

function buchungGeklickt(empfehlung: Empfehlung) {
  trackEvent("hautanalyse_booking_click", {
    event_category: "conversion",
    utm_content: empfehlung.behandlung?.slug,
  });
}

function zuruecksetzen() {
  ergebnis.value = null;
  schritt.value = "intro";
}

onMounted(() => {
  trackEvent("hautanalyse_start", { event_category: "engagement" });
});
</script>

<style scoped>
.hautanalyse__loading,
.hautanalyse__error {
  max-width: var(--container-width-xs);
  margin: 0 auto;
  padding: var(--space-1000) var(--container-pad-xs);
  text-align: center;
}

.hautanalyse__loading p,
.hautanalyse__error p {
  color: var(--color-text-light);
}
</style>
