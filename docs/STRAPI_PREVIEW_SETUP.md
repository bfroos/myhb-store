# Strapi Live Preview Setup Guide

Complete guide to get instant preview updates working for `www.myhealthandbeauty.com`.

---

## 🎯 Problems Solved

1. **Preview changes take 15min to appear** → Fixed with webhook revalidation
2. **Double-click-to-edit doesn't work** → Fixed with `previewScript` event handler
3. **Draft content not showing** → Fixed with `SameSite=none` cookies + `status=draft` API param

---

## 📋 Prerequisites

- Strapi v5+ (Cloud or self-hosted)
- Nuxt 3 frontend deployed on Vercel
- HTTPS enabled (required for `SameSite=none` cookies)

---

## ⚙️ Setup Steps

### 1. Strapi Configuration

**File:** `config/admin.ts` (or `config/admin.js`)

```typescript
export default ({ env }) => {
  const clientUrl = env("CLIENT_URL"); // https://www.myhealthandbeauty.com
  const previewSecret = env("PREVIEW_SECRET");

  return {
    preview: {
      enabled: true,
      config: {
        allowedOrigins: [clientUrl],
        async handler(uid, { documentId, locale, status }) {
          const document = await strapi.documents(uid).findOne({ documentId });
          const pathname = getPreviewPathname(uid, { locale, document });

          if (!pathname) return null; // Disable preview for this content-type

          const urlSearchParams = new URLSearchParams({
            url: pathname,
            secret: previewSecret,
            status,
          });

          return `${clientUrl}/api/preview?${urlSearchParams}`;
        },
      },
    },
  };
};

// Example pathname generator
function getPreviewPathname(uid, { locale, document }): string | null {
  const { slug } = document;

  switch (uid) {
    case "api::page.page":
      if (slug === "homepage") return `/${locale}`;
      return `/${slug}`;

    case "api::product.product":
      return slug ? `/products/${slug}` : "/products";

    case "api::article.article":
      return slug ? `/blog/${slug}` : "/blog";

    default:
      return null; // No preview for this content-type
  }
}
```

**Environment Variables (Strapi `.env`):**

```env
CLIENT_URL=https://www.myhealthandbeauty.com
PREVIEW_SECRET=KatWVxAyGAJMiBpbxOSkNpxDIo0Z5jOIPf82I9fTB2M=
```

---

### 2. Nuxt Frontend Configuration

**✅ Already implemented in this repo:**

- `/server/routes/api/preview.ts` — Sets `SameSite=none` cookies
- `/server/api/strapi/[...path].get.ts` — Adds `status=draft` + `strapi-encode-source-maps`
- `/app/plugins/strapi-live-preview.client.ts` — Handles `strapiUpdate` + `previewScript`
- `/server/middleware/csp-headers.ts` — Allows iframe embedding

**Environment Variables (Vercel):**

```env
# Must match Strapi PREVIEW_SECRET
PREVIEW_SECRET=KatWVxAyGAJMiBpbxOSkNpxDIo0Z5jOIPf82I9fTB2M=

# For webhook revalidation (generate random secret)
STRAPI_WEBHOOK_SECRET=your-random-webhook-secret

# Strapi URLs
NUXT_PUBLIC_STRAPI_URL=https://striking-bear-e5a15ddc94.strapiapp.com
NUXT_PUBLIC_MEDIA_URL=https://striking-bear-e5a15ddc94.media.strapiapp.com
```

---

### 3. Strapi Webhooks (Production Cache Fix)

**Navigate to:** Strapi Admin > Settings > Webhooks > Create

| Field | Value |
|-------|-------|
| **Name** | Vercel ISR Revalidation |
| **URL** | `https://www.myhealthandbeauty.com/api/revalidate` |
| **Events** | ✅ `entry.publish`<br>✅ `entry.update`<br>✅ `entry.unpublish` |
| **Headers** | `x-webhook-secret`: `[YOUR_STRAPI_WEBHOOK_SECRET]` |

**Test webhook:**

```bash
curl -X POST https://www.myhealthandbeauty.com/api/revalidate \
  -H "x-webhook-secret: YOUR_SECRET" \
  -H "content-type: application/json" \
  -d '{
    "model": "api::page.page",
    "entry": {
      "documentId": "abc123",
      "slug": "pricing"
    }
  }'
```

Expected response:

```json
{
  "revalidated": true,
  "model": "api::page.page",
  "documentId": "abc123",
  "paths": [
    { "path": "/pricing", "success": true, "clearedKeys": 3 }
  ]
}
```

---

### 4. Vercel Environment Variables

**Project:** `myhb-store` (www.myhealthandbeauty.com)

```bash
# Set via Vercel Dashboard or CLI
vercel env add PREVIEW_SECRET production
# Paste: KatWVxAyGAJMiBpbxOSkNpxDIo0Z5jOIPf82I9fTB2M=

vercel env add STRAPI_WEBHOOK_SECRET production
# Paste your generated secret

# Redeploy to apply
vercel --prod
```

---

## 🧪 Testing

### 1. Check Preview Debug Endpoint

Visit: https://www.myhealthandbeauty.com/api/preview-debug

Expected output:

```json
{
  "preview": {
    "active": false,
    "status": "not set",
    "cookie": "missing"
  },
  "environment": {
    "previewSecret": "[set]",
    "webhookSecret": "[set]"
  }
}
```

### 2. Enter Preview Mode

Click "Open Preview" in Strapi Content Manager → Opens iframe with URL like:

```
https://www.myhealthandbeauty.com/api/preview?secret=...&url=/products/test&status=draft
```

**Expected:**
- Redirects to `/products/test`
- Sets `__NUXT_PREVIEW=true` cookie (check DevTools > Application > Cookies)
- Preview iframe shows draft content

### 3. Test Live Updates

1. Make a change in Strapi (e.g., edit product title)
2. Click **Save** (don't publish yet)
3. **Expected:** Preview iframe reloads within 1-2 seconds
4. **Check console:** Should see `[strapi-preview] → strapiUpdate received, reloading...`

### 4. Test Double-Click Editing (Growth/Enterprise only)

1. Double-click any text in the preview
2. **Expected:** Strapi opens a popover to edit that field
3. **Check console:** Should see `[strapi-preview] → previewScript received, injecting...`

**Note:** This requires Strapi **Growth** or **Enterprise** plan. Free plan only supports preview, not inline editing.

### 5. Test Production Cache Invalidation

1. Publish a change in Strapi
2. Check Strapi Webhooks panel → Should show delivery to `/api/revalidate` (status 200)
3. Visit public site (not in preview) → Should see changes within ~5 seconds

---

## 🐛 Troubleshooting

### Preview doesn't load / "Invalid token" error

**Cause:** `PREVIEW_SECRET` mismatch between Strapi and Nuxt

**Fix:**

```bash
# Check Strapi .env
echo $PREVIEW_SECRET

# Check Vercel env
vercel env ls

# They must match exactly (including trailing =)
```

### Changes don't appear in preview

**Check console for errors:**

1. Open preview in new tab (copy iframe URL)
2. Open DevTools > Console
3. Look for `[strapi-preview]` logs

**Common issues:**

- ❌ Cookie not set → Check `/api/preview` route sets `SameSite=none; Secure`
- ❌ `status=draft` missing → Check `/server/api/strapi/[...path].get.ts` adds param
- ❌ CORS error → Check Strapi `allowedOrigins` includes your domain

### Double-click editing doesn't work

**Cause:** Strapi Free plan only supports preview, not live editing

**Solutions:**

- Upgrade to Growth/Enterprise plan
- OR use Side Editor (manually edit in Content Manager while viewing preview)

### Production changes take 15min to appear

**Cause:** Webhook not configured or failing

**Check:**

1. Strapi > Settings > Webhooks → Verify webhook exists
2. Click webhook → View "Trigger History" → Check for 401/500 errors
3. If 401: Verify `x-webhook-secret` header matches `STRAPI_WEBHOOK_SECRET`

**Test manually:**

```bash
curl -X POST https://www.myhealthandbeauty.com/api/revalidate \
  -H "x-webhook-secret: YOUR_SECRET" \
  -H "content-type: application/json" \
  -d '{"model":"api::page.page","entry":{"documentId":"test","slug":"test"}}'
```

---

## 📚 References

- [Strapi Preview Docs](https://docs.strapi.io/cms/features/preview)
- [Nuxt Preview Mode](https://nuxt.com/docs/api/composables/use-preview-mode)
- [SameSite Cookie Spec](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [Nitro Cache Storage](https://nitro.unjs.io/guide/storage)

---

## 🆘 Still stuck?

Check `/api/preview-debug` for diagnostics, or contact support with:

1. Output from `/api/preview-debug`
2. Browser console logs (with `[strapi-preview]` prefix)
3. Strapi webhook delivery logs (Settings > Webhooks > Trigger History)
