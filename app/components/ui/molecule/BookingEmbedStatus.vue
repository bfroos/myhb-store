<template>
  <div
    v-if="!ready"
    class="bookingEmbedStatus__overlay"
    role="status"
    :aria-label="t('dialogs.booking.loading')"
  >
    <UiLayoutIconWrapper :size="40" rotate>
      <IconLoader />
    </UiLayoutIconWrapper>
    <span class="bookingEmbedStatus__label">
      {{ t("dialogs.booking.loading") }}
    </span>
  </div>
  <div v-if="showHint" class="bookingEmbedStatus__hint">
    <span>{{ t("dialogs.booking.slowHint") }}</span>
    <a :href="url" target="_blank" rel="noopener noreferrer">
      {{ t("dialogs.booking.openInNewTab") }}
    </a>
  </div>
</template>
<script setup lang="ts">
import { IconLoader } from "@tabler/icons-vue";

/**
 * Ladezustand ueber dem Buchungs-Embed (Calendly-Widget oder App-iFrame).
 *
 * Beide Embeds sind fremde Seiten in einem iFrame: Das `load`-Ereignis sagt
 * nur, dass das Dokument da ist — Calendly und die App zeichnen erst Sekunden
 * spaeter. Bis dahin stand im Dialog ein weisses Feld, das aussah, als sei die
 * Buchung gar nicht aufgegangen (Bugreport Benjamin, 16.09.2026, gemessen
 * ~8 s auf den Meta-Landingpages).
 *
 * `ready` meldet die einbettende Komponente, wenn das Embed sich selbst
 * meldet — Calendly per postMessage, die App per `myhb:booking-ready`.
 *
 * Der Hinweis erscheint erst nach `hintAfterMs` und liegt bewusst *nicht*
 * ueber dem Embed: Bleibt eine Meldung aus, obwohl das Embed laengst
 * gezeichnet hat, verdeckt er nichts.
 *
 * #141: Der Notausgang stand bei 12 s. Gemessen wurde am 20.09.2026, dass der
 * Kalender im kalten Fall 12 bis ueber 36 Sekunden braucht — wer so lange
 * wartet, ist laengst weg. 6 s liegt ueber dem gewaermten Normalfall (1–3 s)
 * und bietet den Ausweg noch, solange jemand hinsieht.
 */
const props = withDefaults(
  defineProps<{
    /** Das Embed hat sich gemeldet. */
    ready: boolean;
    /** Buchungs-URL fuer den Notausgang in einen neuen Tab. */
    url?: string;
    hintAfterMs?: number;
  }>(),
  { hintAfterMs: 6000 },
);

const { t } = useI18n();
const showHint = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;

onMounted(() => {
  timer = setTimeout(() => {
    if (!props.ready && props.url) showHint.value = true;
  }, props.hintAfterMs);
});

watch(
  () => props.ready,
  (ready) => {
    if (!ready) return;
    showHint.value = false;
    if (timer) clearTimeout(timer);
  },
);

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>
<style scoped>
.bookingEmbedStatus__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-300);
  background: var(--color-card-bg-light);
}

.bookingEmbedStatus__label {
  font-size: var(--font-sm);
  line-height: var(--line-sm);
  color: var(--color-text-light);
}

.bookingEmbedStatus__hint {
  position: absolute;
  inset-inline: 0;
  bottom: 0;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-200);
  padding: var(--space-200) var(--space-300);
  background: var(--color-card-bg-light);
  border-top: 1px var(--color-border-mute) solid;
  font-size: var(--font-xs);
  line-height: var(--line-xs);
  color: var(--color-text-light);
}

.bookingEmbedStatus__hint a {
  text-decoration: underline;
}
</style>
