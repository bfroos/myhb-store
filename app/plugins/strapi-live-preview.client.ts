/**
 * Strapi Live Preview Plugin for Nuxt 3
 *
 * Listens for strapiUpdate events from Strapi admin panel and refreshes
 * the preview when content is saved. The preview mode is maintained via
 * SameSite=none cookies set by /api/preview route.
 *
 * See: https://docs.strapi.io/cms/features/preview
 */

export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return;

  // Only activate when inside an iframe
  if (window === window.parent) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[strapi-preview] Not in iframe, plugin inactive');
    }
    return;
  }

  console.log('[strapi-preview] ✓ Activated in iframe');

  const STRAPI_URLS = [
    'https://striking-bear-e5a15ddc94.strapiapp.com',
    'http://localhost:1337',
  ];

  const isAllowedOrigin = (origin: string): boolean => {
    if (STRAPI_URLS.includes(origin)) return true;
    if (origin.endsWith('.strapiapp.com')) return true;
    return false;
  };

  const handleStrapiMessage = (event: MessageEvent) => {
    // Only accept from parent (Strapi admin)
    if (event.source !== window.parent) return;

    // Validate origin
    if (!isAllowedOrigin(event.origin)) {
      console.warn(`[strapi-preview] ⚠️ Rejected message from ${event.origin}`);
      return;
    }

    const { type, payload } = event.data ?? {};

    if (type === 'strapiUpdate') {
      console.log('[strapi-preview] → strapiUpdate received, reloading...');
      // Soft reload: preserves cookies because we're not changing domain
      window.location.reload();
    } else if ((type === 'previewScript' || type === 'strapiScript') && payload?.script) {
      // Strapi v5 docs say 'previewScript', but some versions send 'strapiScript'
      console.log(`[strapi-preview] → ${type} received, injecting...`);
      try {
        const script = document.createElement('script');
        script.textContent = payload.script;
        document.head.appendChild(script);
      } catch (e) {
        console.error('[strapi-preview] Script injection failed:', e);
      }
    }
  };

  // Listen for messages from Strapi
  window.addEventListener('message', handleStrapiMessage);

  // Signal ready to Strapi (with wildcard origin for compatibility)
  window.parent?.postMessage({ type: 'previewReady' }, '*');
  console.log('[strapi-preview] → Sent previewReady');

  // Cleanup
  return () => {
    window.removeEventListener('message', handleStrapiMessage);
  };
});
