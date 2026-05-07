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
 *
 * NOTE on origin filtering:
 * We accept messages from known Strapi origins AND from the actual parent window
 * origin (resolved at runtime). Strapi Cloud may send from subdomains or internal
 * URLs that don't match the public admin URL exactly.
 *
 * NOTE on postMessage failures:
 * Strapi Enterprise may send `previewScript`/`strapiUpdate` with a specific
 * targetOrigin that doesn't match our window.origin. Those browser errors are
 * harmless — they come from Strapi's side and we can't suppress them.
 * As a fallback, we also poll for changes every 2 seconds while in preview mode.
 */
export default defineNuxtPlugin(() => {
  // Only activate when inside an iframe (Strapi preview)
  if (typeof window === 'undefined') return;
  if (window === window.parent) return; // Not in an iframe — skip

  const STRAPI_ORIGINS = [
    'https://striking-bear-e5a15ddc94.strapiapp.com',
    'http://localhost:1337',
  ];

  // Detect the actual parent origin at runtime (covers Strapi Cloud internal URLs)
  let parentOrigin: string | null = null;
  try {
    parentOrigin = document.referrer ? new URL(document.referrer).origin : null;
  } catch {
    parentOrigin = null;
  }

  const isAllowedOrigin = (origin: string) => {
    if (STRAPI_ORIGINS.includes(origin)) return true;
    if (parentOrigin && origin === parentOrigin) return true;
    // Allow any strapiapp.com subdomain (Strapi Cloud)
    if (origin.endsWith('.strapiapp.com')) return true;
    return false;
  };

  let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  let scriptInjected = false;
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let lastRefreshAt = Date.now();

  const triggerRefresh = async () => {
    if (refreshTimeout) clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(async () => {
      lastRefreshAt = Date.now();
      await refreshNuxtData();
    }, 300);
  };

  const handleMessage = async (event: MessageEvent) => {
    // Only handle messages from parent window
    if (event.source !== window.parent) return;
    // Only handle messages from known/allowed origins
    if (!isAllowedOrigin(event.origin)) return;

    const { type, payload } = event.data ?? {};

    if (type === 'strapiUpdate') {
      await triggerRefresh();
    } else if (type === 'previewScript' && payload?.script && !scriptInjected) {
      // Inject the script Strapi sends — handles double-click-to-edit
      const script = document.createElement('script');
      script.textContent = payload.script;
      document.head.appendChild(script);
      scriptInjected = true;
      // Stop polling once we have the previewScript — Strapi will send strapiUpdate events
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    }
  };

  window.addEventListener('message', handleMessage);

  // Notify Strapi we're ready — it will respond with previewScript.
  // Must use '*' as targetOrigin so the admin panel (cross-origin) receives it.
  // Keep pinging until Strapi responds with previewScript (or for max 15s).
  let readyPingCount = 0;
  const maxReadyPings = 15;
  const readyPingInterval = setInterval(() => {
    if (scriptInjected || readyPingCount >= maxReadyPings) {
      clearInterval(readyPingInterval);
      return;
    }
    window.parent.postMessage({ type: 'previewReady' }, '*');
    readyPingCount++;
  }, 1000);

  // Send immediately on load too
  window.parent.postMessage({ type: 'previewReady' }, '*');

  // Fallback: poll every 2s in case postMessage doesn't work (origin mismatch).
  // Stops automatically once previewScript arrives (Strapi will send strapiUpdate).
  // This ensures saves are always reflected even if the postMessage handshake fails.
  pollInterval = setInterval(async () => {
    // Only poll if we haven't refreshed in the last 1.5s (avoid double-refresh)
    if (Date.now() - lastRefreshAt > 1500) {
      lastRefreshAt = Date.now();
      await refreshNuxtData();
    }
  }, 2000);

  // Stop polling after 30s if no previewScript received (avoid unnecessary traffic)
  setTimeout(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }, 30_000);
});
