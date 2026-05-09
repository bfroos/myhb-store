<template>
  <LandingPageSocial />
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

// SEO Meta Tags for Social Traffic
useHead({
  title: 'Botox gegen Zornesfalte Köln | Strahlend & Entspannt',
  meta: [
    {
      name: 'description',
      content: 'Botox gegen Zornesfalten in Köln. Sanfte Behandlung, natürliches Aussehen. Quiz: Finde deine ideale Behandlung. Über 5.000 zufriedene Patienten.',
    },
    {
      name: 'keywords',
      content: 'Botox Köln, Zornesfalte, Botox Zornesfalte, Falten behandlung, Aesthetic Medicine',
    },
    {
      property: 'og:title',
      content: 'Botox gegen Zornesfalte Köln | Strahlend & Entspannt',
    },
    {
      property: 'og:description',
      content: 'Botox gegen Zornesfalten in Köln. Sanfte Behandlung, natürliches Aussehen. Quiz: Finde deine ideale Behandlung.',
    },
    {
      name: 'og:image',
      content: '[Instagram Lifestyle Image]',
    },
  ],
  link: [
    {
      rel: 'canonical',
      href: 'https://myhealthandbeauty.com/lp/botox-zornesfalte-koeln',
    },
  ],
});
</script>
