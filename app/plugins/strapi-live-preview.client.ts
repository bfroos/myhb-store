/**
 * Strapi Live Preview Plugin (Growth/Enterprise)
 *
 * Strategy: Listen to strapiUpdate events from Strapi, then soft-reload via URL-param.
 * The poll is now ONLY a long-term safety net (every 30s), not the primary mechanism.
 */
export default defineNuxtPlugin(() => {
  if (typeof window === 'undefined') return;
  if (window === window.parent) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('[strapi-live-preview] Not in iframe, plugin inactive');
    }
    return;
  }
  console.log('[strapi-live-preview] ✓ In iframe, activating preview mode');

  const STRAPI_ORIGINS = [
    'https://striking-bear-e5a15ddc94.strapiapp.com',
    'http://localhost:1337',
  ];

  let parentOrigin: string | null = null;
  try {
    parentOrigin = document.referrer ? new URL(document.referrer).origin : null;
  } catch {
    parentOrigin = null;
  }

  const isAllowedOrigin = (origin: string) => {
    if (STRAPI_ORIGINS.includes(origin)) return true;
    if (parentOrigin && origin === parentOrigin) return true;
    if (origin.endsWith('.strapiapp.com')) return true;
    return false;
  };

  let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  let scriptInjected = false;
  let lastStrapiUpdate = 0;

  const triggerRefresh = async () => {
    if (refreshTimeout) clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(async () => {
      lastStrapiUpdate = Date.now();
      console.log('[strapi-live-preview] → Soft reload via URL-param (strapiUpdate event)');
      
      try {
        // Use URL-parameter change to trigger a soft reload
        const url = new URL(window.location.href);
        const timestamp = Date.now();
        url.searchParams.set('_preview_refresh', timestamp.toString());
        window.location.href = url.toString();
      } catch (e) {
        console.error('[strapi-live-preview] Refresh failed:', e);
      }
    }, 200);
  };

  const handleMessage = async (event: MessageEvent) => {
    if (event.source !== window.parent) return;
    if (!isAllowedOrigin(event.origin)) {
      console.warn(`[strapi-live-preview] ⚠️ Blocked origin: ${event.origin}`);
      return;
    }

    const { type, payload } = event.data ?? {};
    console.log(`[strapi-live-preview] ✓ Event: type="${type}"`);

    if (type === 'strapiUpdate') {
      console.log('[strapi-live-preview] → strapiUpdate: triggering refresh');
      await triggerRefresh();
    } else if ((type === 'previewScript' || type === 'strapiScript') && payload?.script && !scriptInjected) {
      console.log(`[strapi-live-preview] ✓ ${type} received, attempting injection`);
      try {
        const script = document.createElement('script');
        if (payload.script.startsWith('http') || payload.script.startsWith('//')) {
          console.log(`[strapi-live-preview]   → External URL: ${payload.script}`);
          script.src = payload.script;
          script.crossOrigin = 'anonymous';
        } else {
          console.log('[strapi-live-preview]   → Inline code');
          script.textContent = payload.script;
        }
        document.head.appendChild(script);
        scriptInjected = true;
        console.log('[strapi-live-preview]   ✓ Script installed');
      } catch (e) {
        console.error('[strapi-live-preview] Script injection failed:', e);
      }
    }
  };

  window.addEventListener('message', handleMessage);
  console.log('[strapi-live-preview] ✓ Message listener ready');

  // Ping ready every 1s for 15s
  let readyPingCount = 0;
  const readyPingInterval = setInterval(() => {
    if (scriptInjected || readyPingCount >= 15) {
      clearInterval(readyPingInterval);
      return;
    }
    window.parent.postMessage({ type: 'previewReady' }, '*');
    console.debug(`[strapi-live-preview] → Ping ${readyPingCount + 1}/15`);
    readyPingCount++;
  }, 1000);

  console.log('[strapi-live-preview] → Sending initial previewReady');
  window.parent.postMessage({ type: 'previewReady' }, '*');

  // Long-term safety net: every 30 seconds, check if Strapi update wasn't received
  // This is a fallback only — the main trigger is strapiUpdate events
  console.log('[strapi-live-preview] ✓ Starting 30s safety-net poll');
  const longPoll = setInterval(async () => {
    // If no strapiUpdate in last 25s, do a refresh
    if (Date.now() - lastStrapiUpdate > 25_000) {
      console.log('[strapi-live-preview] → Safety net: 30s without update, refreshing');
      await triggerRefresh();
    }
  }, 30_000);

  // Note: We keep the long-poll running as a fallback, but the main mechanism
  // is listening to strapiUpdate events from Strapi.
});
