# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build
```

Locally preview production build:

```bash
# npm
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Redirects (Strapi-powered)

This project supports CMS-managed redirects stored in Strapi and consumed by Nuxt at runtime. It also supports local redirects configured in `frontend/server/assets/redirects.json`. Redirects work on:

- direct requests (server middleware)
- client-side navigation (Nuxt route middleware + lookup API)

### Nuxt runtime

Redirect logic lives in:

- `frontend/server/utils/redirects.ts` (fetch + cache + normalization)
- `frontend/server/middleware/redirects.ts` (server-side redirects)
- `frontend/server/api/redirect-lookup.get.ts` (client lookup API)
- `frontend/app/middleware/redirects.global.ts` (client-side navigation)

Environment variables:

- `NUXT_PUBLIC_STRAPI_URL` (public, used by Nuxt server)
- `STRAPI_API_TOKEN` (server-only, optional but recommended)

The middleware is fail-open: if Strapi is unavailable, the site keeps working and no redirect is applied.

### How to enter URLs

Create an entry in the `redirect` collection.

**Strapi Permissions:** Damit Redirects aus der Collection funktionieren, muss die Strapi-Rolle **Public** für den Content-Type **Redirect** die Berechtigung **find** (bzw. **findMany**) haben. Einstellungen → Users & Permissions → Roles → Public → Redirect → find aktivieren.

Use path-only values with a leading slash:

- `from`: `/behandlungen/botox/stirnfalte`
- `to`: `/behandlungen/botox`

`to` can also be a full URL for external redirects. `from` can be a full URL, but it will be normalized to the path and is not required.

### i18n behavior

Redirects match exact paths. Add one entry per locale path. For example:

- default locale: `/behandlungen/...`
- English: `/en/treatments/...`
- Turkish: `/tr/tedaviler/...`
- Arabic: `/ar/ilajat/...`

### One-time CSV import

There is a helper script in `cms/scripts/import-redirects.mjs` that imports CSV files with the headers `from`, `to`, `code`.

Example:

```bash
NUXT_PUBLIC_STRAPI_URL=http://localhost:1337 \
STRAPI_API_TOKEN=YOUR_TOKEN \
node cms/scripts/import-redirects.mjs --file=/path/to/redirects.csv
```

## Sitemap (runtime)

The sitemap is generated and cached at runtime under `/sitemap.xml` (24h maxAge + staleMaxAge). It includes `<xhtml:link>` hreflang alternates and a `sitemap.xsl` stylesheet.

Implementation:

- `frontend/server/routes/sitemap.xml.ts` (builds URLs, caching, Strapi fetch)
- `frontend/public/robots.txt` (points to `/sitemap.xml`)

Configuration:

- `NUXT_PUBLIC_STRAPI_URL` (required, content source via Strapi REST)
- `NUXT_PUBLIC_URL` (optional, for absolute URLs; otherwise request host)

Content:

- Static routes from `ROUTE_MAP` (per locale, default locale `de`)
- Strapi collections: `treatment-pages`, `cities`, `locations` (plus location treatments), `blog-categories`, `blog-articles`, `career-page` jobs, `employees` (filtered `isActive=true` and `hideFromPublic=false`), `products`, `pages`
- Duplicates are removed; `lastmod` is derived from `updatedAt`

Extending:

- Add to `ROUTE_MAP` if a new URL structure is needed
- Load a new Strapi collection in `fetchCollection`
- Use `getLocalizedPath(...)` and `addUrl(...)` to add entries to the sitemap

## New static pages (Nuxt routes)

When you add a new file-based page (e.g. `frontend/app/pages/foobar.vue`), make sure to check:

- i18n route mapping: update the i18n config so each locale has the correct path (see `ROUTE_MAP` in `frontend/server/routes/sitemap.xml.ts` for the canonical mapping)
- Sitemap: add the new route to `ROUTE_MAP` and, if it is a static page, include it in the `staticRoutes` list so it appears in `/sitemap.xml`
- Navigation and links: update menus or internal links if the page should be reachable from the UI
- Redirects: if this page replaces or renames an old URL, add a redirect in Strapi or `frontend/server/assets/redirects.json`
