/**
 * Strapi Webhook Handler for On-Demand ISR Revalidation
 * 
 * Strapi sends webhooks on content publish/update/unpublish.
 * This endpoint revalidates affected paths so changes appear immediately
 * instead of waiting for the ISR cache timeout (15min).
 * 
 * Setup in Strapi:
 * Settings > Webhooks > Create
 * - URL: https://www.myhealthandbeauty.com/api/revalidate
 * - Events: entry.publish, entry.update, entry.unpublish
 * - Headers: { "x-webhook-secret": "YOUR_SECRET" }
 */

export default defineEventHandler(async (event) => {
  try {
    // 1. Validate webhook secret
    const secret = getHeader(event, 'x-webhook-secret');
    const expectedSecret = process.env.STRAPI_WEBHOOK_SECRET;

    if (!expectedSecret) {
      console.warn('[revalidate] STRAPI_WEBHOOK_SECRET not configured');
      return { revalidated: false, error: 'Server misconfigured' };
    }

    if (secret !== expectedSecret) {
      console.warn('[revalidate] Invalid webhook secret');
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid webhook secret',
      });
    }

    // 2. Parse Strapi webhook payload
    const body = await readBody(event);
    const { model, entry } = body;

    if (!model || !entry) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing model or entry in webhook payload',
      });
    }

    console.log(`[revalidate] Received webhook for ${model}:${entry.documentId}`);

    // 3. Determine which paths to revalidate
    const pathsToRevalidate: string[] = [];

    switch (model) {
      case 'api::page.page':
        // Homepage
        if (entry.slug === 'homepage') {
          pathsToRevalidate.push('/');
        }
        // Static pages (pricing, contact, faq)
        else if (['pricing', 'contact', 'faq'].includes(entry.slug)) {
          pathsToRevalidate.push(`/${entry.slug}`);
        }
        break;

      case 'api::product.product':
        if (entry.slug) {
          pathsToRevalidate.push(`/products/${entry.slug}`);
        }
        // Also revalidate product listing
        pathsToRevalidate.push('/products');
        break;

      case 'api::article.article':
        if (entry.slug) {
          pathsToRevalidate.push(`/blog/${entry.slug}`);
        }
        // Also revalidate blog listing
        pathsToRevalidate.push('/blog');
        break;

      default:
        console.log(`[revalidate] No revalidation rules for model: ${model}`);
        return { revalidated: false, info: 'No matching revalidation rules' };
    }

    // 4. Purge Nuxt/Nitro cache for these paths
    // Use Nitro's storage layer to invalidate cached responses
    const storage = useStorage('cache:nitro');
    const results = await Promise.allSettled(
      pathsToRevalidate.map(async (path) => {
        try {
          // Nitro caches responses under cache:nitro:<route-key>
          // We need to invalidate all cache entries matching this path
          const keys = await storage.getKeys();
          const matchingKeys = keys.filter((key) => key.includes(path));
          
          await Promise.all(matchingKeys.map((key) => storage.removeItem(key)));
          
          console.log(`[revalidate] ✓ Cleared ${matchingKeys.length} cache entries for ${path}`);
          return { path, success: true, clearedKeys: matchingKeys.length };
        } catch (err) {
          console.error(`[revalidate] ✗ Failed to clear ${path}:`, err);
          return { path, success: false, error: String(err) };
        }
      })
    );

    return {
      revalidated: true,
      model,
      documentId: entry.documentId,
      paths: results.map((r) =>
        r.status === 'fulfilled' ? r.value : { error: r.reason }
      ),
    };
  } catch (error: any) {
    console.error('[revalidate] Error:', error);
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || 'Revalidation failed',
    });
  }
});
