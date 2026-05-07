/**
 * Strapi Live Preview Plugin (Growth/Enterprise)
 *
 * CRITICAL: Keep the fallback poll running at all times, even if the Strapi
 * injected script succeeds or fails. The poll is the ultimate safety net for
 * ensuring preview data updates.
 *
 * Flow:
 * 1. Send previewReady to Strapi
 * 2. Strapi sends strapiScript (may be broken or throw errors)
 * 3. Try to inject it (best effort, errors are non-fatal)
 * 4. Fallback poll runs FOREVER every 2s to catch any missed updates
 * 5. When save happens, poll will refresh via URL-param change (soft reload)
 *
 * The poll is the most reliable mechanism — it doesn't depend on Strapi's
 * event system working perfectly.
 *
 * IMPORTANT: We use URL-param reload instead of window.location.reload()
 * to preserve the __NUXT_PREVIEW cookie across iframe boundaries.
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
  let lastRefreshAt = Date.now();

  const triggerRefresh = async () => {
    if (refreshTimeout) clearTimeout(refreshTimeout);
    refreshTimeout = setTimeout(async () => {
      lastRefreshAt = Date.now();
      console.log('[strapi-live-preview] → Triggering soft reload via URL-param (preserves __NUXT_PREVIEW cookie)...');
      
      try {
        // Use URL-parameter change to trigger a soft reload that preserves cookies
        // This is safer than window.location.reload() which can lose cross-domain cookies
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
    if (event.source !== window.parent) {
      console.debug('[strapi-live-preview] Message from non-parent, ignoring');
      return;
    }
    if (!isAllowedOrigin(event.origin)) {
      console.warn(`[strapi-live-preview] ⚠️ Blocked origin: ${event.origin}`);
      return;
    }

    const { type, payload } = event.data ?? {};
    console.log(`[strapi-live-preview] ✓ Event: type="${type}"`);

    if (type === 'strapiUpdate') {
      console.log('[strapi-live-preview] → strapiUpdate received, soft reload');
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
        console.log('[strapi-live-preview]   ✓ Script installed (may be broken, but poll will handle it)');
      } catch (e) {
        console.error('[strapi-live-preview] Script injection failed (non-fatal):', e);
        // Don't set scriptInjected=true, keep trying via poll
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
      if (readyPingCount >= 15) {
        console.warn('[strapi-live-preview] ⚠️ No script after 15s, but poll continues as fallback');
      }
      return;
    }
    window.parent.postMessage({ type: 'previewReady' }, '*');
    console.debug(`[strapi-live-preview] → Ping ${readyPingCount + 1}/15`);
    readyPingCount++;
  }, 1000);

  console.log('[strapi-live-preview] → Sending initial previewReady');
  window.parent.postMessage({ type: 'previewReady' }, '*');

  // CRITICAL: Fallback poll runs FOREVER
  // Every 2 seconds, if nothing refreshed recently, do a soft reload via URL-param.
  console.log('[strapi-live-preview] ✓ Starting fallback poll (every 2s, runs forever)');
  const pollInterval = setInterval(async () => {
    if (Date.now() - lastRefreshAt > 1500) {
      console.log('[strapi-live-preview] → Poll: auto-refresh (no recent activity)');
      await triggerRefresh();
    }
  }, 2000);

  // Note: We do NOT stop the poll. It runs forever as the ultimate safety net.
  // This ensures that even if Strapi's event system fails, preview updates still work.
});
