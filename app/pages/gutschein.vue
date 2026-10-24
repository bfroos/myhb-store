<template>
  <UiLayoutSectionBlock spacing="sibling">
    <div class="gutschein theme-light">
      <div class="gutschein__bild">
        <img
          :src="BILD"
          alt="MY HEALTH & BEAUTY Geschenkgutschein mit roter Schleife"
          width="600"
          height="661"
          loading="eager"
        />
      </div>

      <div class="gutschein__kauf">
        <h1 class="gutschein__titel">Geschenkgutschein</h1>
        <p class="gutschein__intro">
          Schenk Zeit für Schönheit und Wohlbefinden – einlösbar für alle Behandlungen an allen
          unseren Standorten. Den Gutschein bekommst du direkt nach dem Kauf per E-Mail, zum
          Ausdrucken oder Weiterleiten.
        </p>

        <fieldset class="gutschein__betraege">
          <legend>Betrag wählen</legend>
          <button
            v-for="b in GUTSCHEIN_BETRAEGE"
            :key="b.variantId"
            type="button"
            class="gutschein__betrag"
            :class="{ 'gutschein__betrag--aktiv': b.euro === euro }"
            :aria-pressed="b.euro === euro"
            @click="euro = b.euro"
          >
            {{ euroText(b.euro) }}
          </button>
        </fieldset>

        <label class="gutschein__menge">
          Anzahl
          <select v-model.number="menge">
            <option v-for="n in GUTSCHEIN_MAX_MENGE" :key="n" :value="n">{{ n }}</option>
          </select>
        </label>

        <UiAtomBaseButton
          as="a"
          :href="checkoutUrl ?? undefined"
          size="lg"
          full-width
          rel="nofollow"
          @click="kaufGeklickt"
        >
          Jetzt für {{ euroText(euro * menge) }} kaufen
        </UiAtomBaseButton>
        <p class="gutschein__hinweis">
          Sichere Zahlung mit Karte, PayPal, Klarna (auch in Raten), Apple Pay oder Google Pay.
        </p>
      </div>
    </div>
  </UiLayoutSectionBlock>

  <UiLayoutSectionBlock spacing="sibling">
    <div class="gutschein__fragen theme-light">
      <div class="gutschein__frage">
        <h2>So funktioniert's</h2>
        <ol>
          <li>Betrag wählen und bezahlen.</li>
          <li>Der Gutschein mit Code kommt sofort per E-Mail.</li>
          <li>Termin buchen und den Code an der Kasse im Standort nennen oder zeigen.</li>
        </ol>
      </div>
      <div class="gutschein__frage">
        <h2>Lieber in Raten zahlen?</h2>
        <p>
          Kauf den Gutschein im Wert deiner Behandlung und wähl beim Bezahlen Klarna oder PayPal
          mit Ratenzahlung. Eingelöst wird der Gutschein beim Termin.
        </p>
      </div>
      <div class="gutschein__frage">
        <h2>Wo kann ich den Gutschein einlösen?</h2>
        <p>
          In allen Standorten von MY HEALTH & BEAUTY, für jede Behandlung. Reicht der Betrag
          nicht, zahlst du den Rest vor Ort; ein Restguthaben bleibt auf dem Gutschein.
        </p>
        <p>
          <NuxtLink to="/standorte">Alle Standorte ansehen</NuxtLink>
        </p>
      </div>
    </div>
  </UiLayoutSectionBlock>
</template>

<script setup lang="ts">
/**
 * Gutscheinkauf auf der Website statt im alten Shopify-Onlineshop
 * (22.10.2026). Bezahlt wird im Shopify-Checkout, Logik und Varianten in
 * shared/geschenkgutschein.ts.
 */
import {
  GUTSCHEIN_BETRAEGE,
  GUTSCHEIN_MAX_MENGE,
  GUTSCHEIN_STANDARD_EURO,
  euroText,
  gutscheinCheckoutUrl,
} from "#shared/geschenkgutschein";

const BILD =
  "https://cdn.shopify.com/s/files/1/0676/2066/7672/files/MY_HEALTH___BEAUTY_Geschenkgutschein.jpg?v=1764246775&width=600";

const route = useRoute();
const { trackEvent } = useGoogleAnalytics();

const euro = ref(GUTSCHEIN_STANDARD_EURO);
const menge = ref(1);
const checkoutUrl = computed(() => gutscheinCheckoutUrl(euro.value, menge.value, route.query));

function kaufGeklickt() {
  trackEvent("gutschein_checkout", {
    event_category: "ecommerce",
    value: euro.value * menge.value,
    currency: "EUR",
    gutschein_betrag: euro.value,
    gutschein_menge: menge.value,
  });
}

useHead({
  title: "Geschenkgutschein kaufen | MY HEALTH & BEAUTY",
  meta: [
    {
      name: "description",
      content:
        "Gutschein für Behandlungen bei MY HEALTH & BEAUTY: Betrag ab 5 € wählen, sofort per E-Mail erhalten, an allen Standorten einlösen. Auch mit Klarna oder PayPal in Raten.",
    },
  ],
});
</script>

<style scoped>
.gutschein,
.gutschein__fragen {
  border-radius: var(--border-radius-card);
  padding: var(--space-600);
}
@media (min-width: 900px) {
  .gutschein,
  .gutschein__fragen {
    padding: var(--space-900);
  }
}
.gutschein {
  display: grid;
  gap: var(--space-800);
  grid-template-columns: 1fr;
  align-items: center;
}
@media (min-width: 900px) {
  .gutschein {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  }
}
.gutschein__bild img {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  height: auto;
  border-radius: var(--border-radius-card-sm);
  display: block;
}
.gutschein__kauf {
  display: flex;
  flex-direction: column;
  gap: var(--space-600);
  max-width: 560px;
}
.gutschein__titel {
  margin: 0;
  font-size: clamp(2rem, 1.5rem + 2vw, 3rem);
  line-height: 1.1;
}
.gutschein__intro,
.gutschein__hinweis {
  margin: 0;
  color: var(--color-text-light);
}
.gutschein__hinweis {
  font-size: var(--font-sm, 14px);
  text-align: center;
}
.gutschein__betraege {
  border: 0;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-300);
}
@media (max-width: 480px) {
  .gutschein__betraege {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
.gutschein__betraege legend {
  font-weight: 600;
  margin-bottom: var(--space-400);
  padding: 0;
}
.gutschein__betrag {
  padding: 12px 4px;
  border-radius: 12px;
  border: 1px solid var(--color-gray-200, #e5e5e5);
  background: var(--color-card-bg-light, #fff);
  color: inherit;
  font: inherit;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.gutschein__betrag:hover {
  border-color: var(--color-gray-700, #444);
}
.gutschein__betrag--aktiv,
.gutschein__betrag--aktiv:hover {
  background: var(--color-black);
  border-color: var(--color-black);
  color: var(--color-white);
}
.gutschein__menge {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}
.gutschein__menge select {
  font: inherit;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--color-gray-200, #e5e5e5);
  background: var(--color-card-bg-light, #fff);
}
.gutschein__fragen {
  display: grid;
  gap: var(--space-700);
  grid-template-columns: 1fr;
}
@media (min-width: 900px) {
  .gutschein__fragen {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
.gutschein__frage h2 {
  margin: 0 0 var(--space-400);
  font-size: clamp(1.2rem, 1.05rem + 0.6vw, 1.5rem);
  line-height: 1.25;
}
.gutschein__frage p {
  margin: 0 0 var(--space-300);
  color: var(--color-text-light);
}
.gutschein__frage a {
  color: var(--color-text);
  font-weight: 600;
}
.gutschein__frage ol {
  list-style: decimal;
  padding-left: 1.2em;
  margin: 0;
  color: var(--color-text-light);
}
.gutschein__frage li + li {
  margin-top: var(--space-200);
}
</style>
