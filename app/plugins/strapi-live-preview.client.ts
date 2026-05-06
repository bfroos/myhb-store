/**
 * Strapi Live Preview Plugin (Growth/Enterprise)
 *
 * Protocol (from Strapi docs):
 * 1. Frontend sends `previewReady` to parent window (with '*' as targetOrigin)
 * 2. Strapi receives it, sends back `previewScript` with the live-preview script
 * 3. Frontend injects the script → handles double-click-to-edit + field highlighting
 * 4. On field change, Strapi sends `strapiUpdate` → frontend refreshes data
 *
 * Only runs when embedded in Strapi's preview iframe (window !== window.parent).
 */
export default defineNuxtPlugin(() => {
  // Only activate when inside an iframe (Strapi preview)
  if (typeof window === 'undefined') return;
  if (window === window.parent) return; // Not in an iframe — skip

  const STRAPI_ORIGINS = [
    'https://striking-bear-e5a15ddc94.strapiapp.com',
    'http://localhost:1337',
  ];

  let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  let scriptInjected = false;

  const handleMessage = async (event: MessageEvent) => {
    if (!STRAPI_ORIGINS.includes(event.origin)) return;

    const { type, payload } = event.data ?? {};

    if (type === 'strapiUpdate') {
      if (refreshTimeout) clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(async () => {
        await refreshNuxtData();
      }, 300);
    } else if (type === 'previewScript' && payload?.script && !scriptInjected) {
      // Inject the script Strapi sends — handles double-click-to-edit
      const script = document.createElement('script');
      script.textContent = payload.script;
      document.head.appendChild(script);
      scriptInjected = true;
    }
  };

  window.addEventListener('message', handleMessage);

  // Notify Strapi we're ready — it will respond with previewScript.
  // Per Strapi docs, postMessage must use '*' as targetOrigin so the admin
  // panel (which may be on a different subdomain) receives the message.
  window.parent.postMessage({ type: 'previewReady' }, '*');
});
