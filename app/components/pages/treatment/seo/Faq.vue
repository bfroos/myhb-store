<template>
  <!-- E24 SEO-Pilot: Fragen als <details> - Antworten stehen im HTML
       (Crawler, KI-Antworten), aufklappbar ohne JavaScript. -->
  <div class="seo-faq">
    <details v-for="(f, i) in faqs" :key="i" class="seo-faq__item" :open="i === 0">
      <summary class="seo-faq__q">{{ f.question }}</summary>
      <PagesTreatmentSeoText class="seo-faq__a" :parts="f.answer" />
    </details>
  </div>
</template>

<script setup lang="ts">
import type { SeoFaq } from "#shared/seoPilotLippen";

defineProps<{ faqs: SeoFaq[] }>();
</script>
