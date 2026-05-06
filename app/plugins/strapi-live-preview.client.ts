/**
 * Strapi Live Preview Plugin
 *
 * Listens for postMessage events from the Strapi Admin panel (Growth/Enterprise).
 * When the editor changes a field, Strapi sends a message to the preview iframe.
 * We respond by refreshing all Nuxt data so the latest draft content is shown.
 *
 * Strapi message types:
 * - 'strapiUpdate': fired on every field change in the editor
 *
 * This is a client-only plugin (*.client.ts) — runs only in the browser.
 */
export default defineNuxtPlugin(() => {
  const STRAPI_ORIGINS = [
    'https://striking-bear-e5a15ddc94.strapiapp.com',
    'http://localhost:1337',
  ];

  let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleMessage = async (event: MessageEvent) => {
    // Security: only accept messages from known Strapi origins
    if (!STRAPI_ORIGINS.includes(event.origin)) return;

    const { type } = event.data ?? {};
    if (type !== 'strapiUpdate') return;

    // Debounce: Strapi fires many events while typing — wait 300ms before refresh
    if (refreshTimeout) clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(async () => {
      await refreshNuxtData();
    }, 300);
  };

  window.addEventListener('message', handleMessage);
});
