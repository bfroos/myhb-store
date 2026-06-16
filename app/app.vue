<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { locale, fallbackLocale } = useI18n();
const currentLocale = computed(
  () => (locale.value || fallbackLocale.value) as string,
);

// Global Organization Schema for Brand Knowledge Panel
const config = useRuntimeConfig();
const { brandName } = useBrand();
const { isAdsMode } = useSiteModeFlags();

const organizationSchema = computed(() => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: brandName.value,
  url: config.public.publicUrl,
  logo: {
    "@type": "ImageObject",
    url: `${config.public.publicUrl}/favicon/favicon.svg`,
    width: 512,
    height: 512,
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+49-221-94899428",
    contactType: "customer service",
    availableLanguage: ["de", "en"],
    areaServed: "DE",
  },
  // Ads landing pages (go.*) must not leak treatment names like "Botox®" into
  // the global Organization JSON-LD. Keep the rich, keyword-bearing description
  // for SEO mode (www.) where it drives brand/treatment relevance.
  description: isAdsMode.value
    ? "Ästhetische Medizin & Behandlungen an mehreren Standorten in Deutschland."
    : "Ästhetische Medizin mit Botox®, Hyaluron und PRP-Therapie an 10 Standorten in Deutschland.",
}));

useSchemaOrg(organizationSchema);

useHead({
  htmlAttrs: {
    lang: currentLocale.value,
  },
  script: [
    {
      innerHTML: `!function(){"use strict";function l(e){for(var t=e,r=0,n=document.cookie.split(";");r<n.length;r++){var o=n[r].split("=");if(o[0].trim()===t)return o[1]}}function s(e){return localStorage.getItem(e)}function u(e){return window[e]}function A(e,t){e=document.querySelector(e);return t?null==e?void 0:e.getAttribute(t):null==e?void 0:e.textContent}var e=window,t=document,r="script",n="dataLayer",o="https://engine.myhealthandbeauty.com",a="",i="ahvzduwaty",c="au2d=EBBcMCEpV0MyNy8gMzMpUA9JU1lEQh4YRBkYHxAFFgIRFQ8TFwEbAw0NTxQaCQ%3D%3D",g="cookie",v="_ga",E="",d=!1;try{var d=!!g&&(m=navigator.userAgent,!!(m=new RegExp("Version/([0-9._]+)(.*Mobile)?.*Safari.*").exec(m)))&&16.4<=parseFloat(m[1]),f="stapeUserId"===g,I=d&&!f?function(e,t,r){void 0===t&&(t="");var n={cookie:l,localStorage:s,jsVariable:u,cssSelector:A},t=Array.isArray(t)?t:[t];if(e&&n[e])for(var o=n[e],a=0,i=t;a<i.length;a++){var c=i[a],c=r?o(c,r):o(c);if(c)return c}else console.warn("invalid uid source",e)}(g,v,E):void 0;d=d&&(!!I||f)}catch(e){console.error(e)}var m=e,g=(m[n]=m[n]||[],m[n].push({"gtm.start":(new Date).getTime(),event:"gtm.js"}),t.getElementsByTagName(r)[0]),v=I?"&bi="+encodeURIComponent(I):"",E=t.createElement(r),f=(d&&(i=8<i.length?i.replace(/([a-z]{8}$)/,"kp$1"):"kp"+i),!d&&a?a:o);E.async=!0,E.src=f+"/"+i+".js?"+c+v,null!=(e=g.parentNode)&&e.insertBefore(E,g)}();`,
      type: 'text/javascript',
    },
  ],
  noscript: [
    {
      innerHTML: `<iframe src="https://engine.myhealthandbeauty.com/ns.html?id=GTM-5KCNWFWS" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
      body: true,
    },
  ],
});
</script>
