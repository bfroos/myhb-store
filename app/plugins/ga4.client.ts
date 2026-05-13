/**
 * Google Analytics 4 Plugin
 * Initializes GA4 tracking on client-side
 */

export default defineNuxtPlugin(() => {
  const router = useRouter();
  const gaId = useRuntimeConfig().public.gaId;

  if (!gaId) {
    console.warn('[GA4] NUXT_PUBLIC_GA_ID not configured');
    return;
  }

  // Initialize gtag global function
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', gaId, {
    page_path: router.currentRoute.value.path,
    anonymize_ip: true,
  });

  // Expose gtag to window
  (window as any).gtag = gtag;

  // Track page views on route change
  router.afterEach((to) => {
    gtag('event', 'page_view', {
      page_path: to.path,
      page_title: document.title,
    });
  });
});
