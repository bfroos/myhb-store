/**
 * Debug endpoint for Strapi Preview troubleshooting
 * 
 * Visit https://www.myhealthandbeauty.com/api/preview-debug
 * to check current preview state, cookies, and cache status.
 */

export default defineEventHandler((event) => {
  const cookies = parseCookies(event);
  const headers = getHeaders(event);
  const url = getRequestURL(event);

  // Check if preview mode is active
  const isPreview = cookies['__NUXT_PREVIEW'] === 'true';
  const previewStatus = cookies['__NUXT_PREVIEW_STATUS'];

  // Get Nitro cache info (if available)
  const storage = useStorage('cache:nitro');
  
  return {
    timestamp: new Date().toISOString(),
    preview: {
      active: isPreview,
      status: previewStatus || 'not set',
      cookie: cookies['__NUXT_PREVIEW'] || 'missing',
    },
    request: {
      url: url.href,
      origin: headers['origin'] || headers['referer'] || 'unknown',
      userAgent: headers['user-agent'] || 'unknown',
    },
    cookies: Object.keys(cookies).map((key) => ({
      name: key,
      value: key.includes('PREVIEW') ? cookies[key] : '[hidden]',
    })),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      strapiUrl: process.env.NUXT_PUBLIC_STRAPI_URL || 'not set',
      previewSecret: process.env.PREVIEW_SECRET ? '[set]' : '[missing]',
      webhookSecret: process.env.STRAPI_WEBHOOK_SECRET ? '[set]' : '[missing]',
    },
    instructions: {
      enterPreviewMode: `${url.origin}/api/preview?secret=${process.env.PREVIEW_SECRET ? '[YOUR_SECRET]' : '[NOT_SET]'}&url=/&status=draft`,
      exitPreviewMode: 'Clear __NUXT_PREVIEW cookie in DevTools',
      testRevalidation: `curl -X POST ${url.origin}/api/revalidate -H "x-webhook-secret: [YOUR_SECRET]" -d '{"model":"api::page.page","entry":{"documentId":"123","slug":"test"}}'`,
    },
  };
});
