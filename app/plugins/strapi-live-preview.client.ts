/**
 * Strapi Live Preview Plugin for Nuxt 3
 *
 * Hybrid Strategy:
 * 1. Listen for strapiUpdate events (instant when they work)
 * 2. Fall back to 5-second polling if strapiUpdate fails
 * 3. Inject strapiScript for double-click-to-edit (best effort, may be broken)
 *
 * The polling is essential because Strapi's injected script often has bugs
 * (e.g. "ReferenceError: ve is not defined") that prevent strapiUpdate events.
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

  let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastRefreshAt = Date.now();
  let scriptInjected = false;

  const triggerRefresh = () => {
    if (refreshTimeout) clearTimeout(refreshTimeout);
    
    refreshTimeout = setTimeout(() => {
      lastRefreshAt = Date.now();
      console.log('[strapi-preview] → Refreshing preview...');
      
      try {
        // URL-param reload (preserves cookies better than location.reload())
        const url = new URL(window.location.href);
        url.searchParams.set('_preview_refresh', Date.now().toString());
        window.location.href = url.toString();
      } catch (e) {
        console.error('[strapi-preview] Refresh failed:', e);
        // Fallback to hard reload
        window.location.reload();
      }
    }, 200); // 200ms debounce
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
      console.log('[strapi-preview] → strapiUpdate received!');
      triggerRefresh();
    } else if ((type === 'previewScript' || type === 'strapiScript') && payload?.script && !scriptInjected) {
      // Strapi v5 docs say 'previewScript', but some versions send 'strapiScript'
      console.log(`[strapi-preview] → ${type} received, injecting (best effort)...`);
      try {
        const script = document.createElement('script');
        script.textContent = payload.script;
        document.head.appendChild(script);
        scriptInjected = true;
        console.log('[strapi-preview] ✓ Script injected (may have bugs, polling is the fallback)');
      } catch (e) {
        console.error('[strapi-preview] Script injection failed (non-fatal):', e);
      }
    }
  };

  // Listen for messages from Strapi
  window.addEventListener('message', handleStrapiMessage);

  // Signal ready to Strapi (with wildcard origin for compatibility)
  window.parent?.postMessage({ type: 'previewReady' }, '*');
  console.log('[strapi-preview] → Sent previewReady');

  // Fallback polling: Check for updates every 5 seconds
  // This is essential because Strapi's injected script is often broken
  console.log('[strapi-preview] ✓ Starting 5s fallback poll');
  
  setInterval(() => {
    const timeSinceLastRefresh = Date.now() - lastRefreshAt;
    
    // If no refresh in last 4.5 seconds, trigger one
    // (This catches strapiUpdate events that never arrived)
    if (timeSinceLastRefresh > 4500) {
      console.log('[strapi-preview] → Poll: auto-reload (no recent activity)');
      triggerRefresh();
    }
  }, 5000);

  // Cleanup
  return () => {
    window.removeEventListener('message', handleStrapiMessage);
  };
});
