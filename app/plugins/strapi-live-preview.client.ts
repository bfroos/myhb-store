/**
 * Strapi Live Preview Plugin (Growth/Enterprise)
 *
 * Critical for Live Preview to work:
 * 1. When strapiUpdate is received, we must re-fetch page data with status=draft
 * 2. The __NUXT_PREVIEW cookie is already set (by /api/preview redirect)
 * 3. The Strapi proxy at /server/api/strapi/[...path].get.ts detects this and adds status=draft
 * 4. So we just need to trigger a real data refresh
 */
export default defineNuxtPlugin(() => {
  // Only activate when inside an iframe (Strapi preview)
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
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let lastRefreshAt = Date.now();

  const triggerRefresh = async () => {
    if (refreshTimeout) clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(async () => {
      lastRefreshAt = Date.now();
      console.log('[strapi-live-preview] → Triggering data refresh (200ms debounce)...');
      
      try {
        // Approach 1: Clear the data cache by navigating and back
        // This forces all useFetch hooks to re-evaluate their cache keys
        console.log('[strapi-live-preview]   → Hard refresh via window.location.reload()');
        window.location.reload();
      } catch (e) {
        console.error('[strapi-live-preview] Refresh failed:', e);
      }
    }, 200);
  };

  const handleMessage = async (event: MessageEvent) => {
    if (event.source !== window.parent) {
      console.debug('[strapi-live-preview] Message from non-parent, ignoring');
      return;
    }
    if (!isAllowedOrigin(event.origin)) {
      console.warn(`[strapi-live-preview] ⚠️ Blocked origin: ${event.origin}`);
      return;
    }

    const { type, payload } = event.data ?? {};
    console.log(`[strapi-live-preview] ✓ Event: type="${type}"`, { payload });

    if (type === 'strapiUpdate') {
      console.log('[strapi-live-preview] → strapiUpdate: HARD RELOAD to get draft data');
      await triggerRefresh();
    } else if ((type === 'previewScript' || type === 'strapiScript') && payload?.script && !scriptInjected) {
      console.log(`[strapi-live-preview] ✓ ${type} received, injecting script`);
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
      console.log('[strapi-live-preview]   ✓ Script injected!');
      if (pollInterval) {
        console.log('[strapi-live-preview]   → Stopping poll');
        clearInterval(pollInterval);
        pollInterval = null;
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

  // Poll every 2s as fallback
  console.log('[strapi-live-preview] ✓ Fallback poll started (every 2s)');
  pollInterval = setInterval(async () => {
    if (Date.now() - lastRefreshAt > 1500) {
      console.debug('[strapi-live-preview] → Poll: refresh');
      lastRefreshAt = Date.now();
      await triggerRefresh();
    }
  }, 2000);

  // Stop poll after 30s
  setTimeout(() => {
    if (pollInterval) {
      console.warn('[strapi-live-preview] ⚠️ Stopping poll after 30s');
      clearInterval(pollInterval);
      pollInterval = null;
    }
  }, 30_000);
});
