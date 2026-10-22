<!--
  Vorschau der OP-Landingpage Haartransplantation (E28), nur zum Abstimmen
  mit Benjamin und Michael. Nicht verlinkt, noindex. Inhalt aus
  app/lib/vorschau/haartransplantation.json (Stand des Strapi-Entwurfs);
  live kommt die Seite aus Strapi unter /lp/haartransplantation.
-->
<template>
  <BlockRenderer :blocks="blocks" />
</template>

<script setup lang="ts">
import inhalt from "~/lib/vorschau/haartransplantation.json";

useHead({ meta: [{ name: "robots", content: "noindex, nofollow" }] });
provideKlinikSeite("#anfrage");
const blocks = (inhalt.blocks as any[]).map((b, i) => ({ id: i + 1, ...b }));
</script>
