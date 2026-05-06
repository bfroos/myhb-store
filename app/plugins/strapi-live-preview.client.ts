/**
 * Strapi Live Preview Plugin (Growth/Enterprise)
 *
 * Implements the full Live Preview protocol:
 * 1. On mount: sends `previewReady` to Strapi → tells Strapi we're in the iframe
 * 2. Listens for `strapiScript` → injects the script Strapi sends into <head>
 *    This script handles: double-click-to-edit highlighting + popover
 * 3. Listens for `strapiUpdate` → refreshes Nuxt data on content save
 *
 * The double-click-to-edit feature works via Content Source Maps:
 * Strapi encodes field metadata as invisible chars in text fields (stega encoding).
 * The injected strapiScript decodes these and shows the edit popover on double-click.
 */
export default defineNuxtPlugin(() => {
  const STRAPI_ORIGINS = [
    'https://striking-bear-e5a15ddc94.strapiapp.com',
    'http://localhost:1337',
  ];

  let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  let scriptInjected = false;

  const handleMessage = async (event: MessageEvent) => {
    // Security: only accept messages from known Strapi origins
    if (!STRAPI_ORIGINS.includes(event.origin)) return;

    const { type, payload } = event.data ?? {};

    if (type === 'strapiUpdate') {
      // Debounce: Strapi fires many events while typing
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(async () => {
        await refreshNuxtData();
      }, 300);
    } else if (type === 'strapiScript' && payload?.script && !scriptInjected) {
      // Inject the Strapi Live Preview script into <head>
      // This enables double-click-to-edit and field highlighting
      const script = document.createElement('script');
      script.textContent = payload.script;
      document.head.appendChild(script);
      scriptInjected = true;
    }
  };

  window.addEventListener('message', handleMessage);

  // Tell Strapi we're ready — triggers it to send the strapiScript
  window.parent?.postMessage({ type: 'previewReady' }, '*');
});
