<template>
  <div class="opAnfrage">
    <p v-if="laedt" class="opAnfrage__hinweis">Lädt …</p>
    <p v-else-if="!funnel" class="opAnfrage__hinweis" role="alert">
      Das Formular lädt gerade nicht.
      <NuxtLink to="/lp/op-anfrage">Hier geht es zur Anfrage-Seite.</NuxtLink>
    </p>
    <LeadFunnelBlock v-else v-bind="funnel" />
  </div>
</template>

<script setup lang="ts">
import LeadFunnelBlock from "~/components/block/LeadFunnelBlock.vue";
import { OP_BEHANDLUNGEN } from "#shared/klinik";

/**
 * Inhalt des Anfrage-Modals (useOpAnfrageDialog). Fragen und Texte kommen aus
 * dem Funnel der Strapi-Landingpage: Haartransplantation hat einen eigenen
 * Funnel (/lp/haartransplantation), alle anderen OPs den allgemeinen
 * (/lp/op-anfrage). Steht die OP schon fest, faellt dort die Frage
 * "Welcher Eingriff interessiert dich?" weg.
 */
const dialogRef = inject("dialogRef") as any;
const behandlung = (dialogRef?.value?.data?.behandlung as string | null) ?? null;
const slug = behandlung === "Haartransplantation" ? "haartransplantation" : "op-anfrage";

const laedt = ref(true);
const funnel = ref<Record<string, any> | null>(null);

onMounted(async () => {
  try {
    const res = await strapiFetch<any>(`/landing-pages/by-slug/${slug}`, { query: { locale: "de" } });
    const block = (res?.data?.blocks ?? []).find((b: any) => b.__component === "blocks.lead-funnel");
    if (!block) return;
    const { id: _id, __component: _c, heroImage: _h, ...rest } = block;
    const steps = (rest.steps ?? []).filter(
      (s: any) => !(behandlung && s.options?.some((o: any) => OP_BEHANDLUNGEN.has(o.label))),
    );
    funnel.value = {
      ...rest,
      steps,
      behandlung: behandlung ?? rest.behandlung,
      variant: "card",
      anchor: "op-anfrage-modal",
    };
  } catch (e) {
    console.error("[op-anfrage] Funnel nicht geladen", e);
  } finally {
    laedt.value = false;
  }
});
</script>

<style scoped>
.opAnfrage__hinweis {
  margin: 0;
  padding: 24px 4px;
  color: var(--color-gray-600);
}
</style>
