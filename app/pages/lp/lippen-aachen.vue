<template>
  <LandingPageAds />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

// SEO Meta Tags for Google Ads traffic
useHead({
  title: 'Lippen aufspritzen Aachen | Perfekte Lippen in einer Stunde',
  meta: [
    {
      name: 'description',
      content: 'Lippen Filler in Aachen von erfahrenen Ärzten. Natürliche Ergebnisse, sichere Behandlung. Kostenloses Beratungsgespräch. Jetzt Termin buchen!',
    },
    {
      name: 'keywords',
      content: 'Lippen aufspritzen Aachen, Lippen Filler Aachen, Lippenvergrößerung, Hyaluronsäure',
    },
    {
      property: 'og:title',
      content: 'Lippen aufspritzen Aachen | Perfekte Lippen in einer Stunde',
    },
    {
      property: 'og:description',
      content: 'Lippen Filler in Aachen von erfahrenen Ärzten. Natürliche Ergebnisse, sichere Behandlung. Kostenloses Beratungsgespräch.',
    },
    {
      name: 'robots',
      content: 'index, follow',
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://myhealthandbeauty.com/lp/lippen-aachen',
    },
  ],
});
</script>
