# 🚀 Landing Pages Deployment Checklist

**Choose your deployment path and follow the checklist.**

---

## Option A: Nuxt Components (Fastest - 5 minutes)

### Pre-Deployment
- [ ] Review `LANDING_PAGES_SUMMARY.md`
- [ ] Verify files exist:
  - [ ] `app/components/block/LandingPageAds.vue`
  - [ ] `app/components/block/LandingPageSocial.vue`
  - [ ] `app/components/block/QuizComponent.vue`
  - [ ] `app/pages/lp/lippen-aachen.vue`
  - [ ] `app/pages/lp/botox-zornesfalte-koeln.vue`

### Deploy
```bash
cd /root/.openclaw/workspace/myhb-store
git add app/components/block/LandingPage*.vue
git add app/components/block/QuizComponent.vue
git add app/pages/lp/*.vue
git add app/pages/treatments/[slug].vue
git commit -m "🚀 Deploy landing pages: Lippen Aachen + Botox Zornesfalte"
git push origin main
```

### Deployment Checklist
- [ ] Git push successful
- [ ] No merge conflicts
- [ ] GitHub Actions running
- [ ] Vercel build started (check https://vercel.com/dashboard)

### Post-Deployment (5-10 mins)
- [ ] Vercel build complete (green checkmark)
- [ ] No build errors
- [ ] Pages accessible:
  - [ ] https://myhealthandbeauty.com/lp/lippen-aachen (loads)
  - [ ] https://myhealthandbeauty.com/lp/botox-zornesfalte-koeln (loads)

### Verification (10 mins)
- [ ] Run Lighthouse audit (DevTools)
- [ ] Check meta tags (Inspect → Head)
- [ ] Test CTA buttons (click works)
- [ ] Check responsive design (mobile view)
- [ ] Verify analytics firing (DevTools Console)

### Launch Complete ✅
- [ ] Pages live and functional
- [ ] Ready to promote in Google Ads
- [ ] Ready to share on social media

---

## Option B: Strapi CMS (Flexible - 30 minutes)

### Pre-Deployment
- [ ] Read `docs/OPTION_B_STRAPI_SCHEMA.md`
- [ ] Verify existing files:
  - [ ] `app/components/block/StrapiLandingPage.vue`
  - [ ] `docs/OPTION_B_STRAPI_SCHEMA.md`

### Setup Strapi Collection
1. **Login to Strapi**
   - [ ] Navigate to: https://striking-bear-e5a15ddc94.strapiapp.com/admin
   - [ ] Verify logged in

2. **Create Collection Type**
   - [ ] Go to Plugins → Content-Type Builder
   - [ ] Click "Create Collection Type"
   - [ ] Name: "Landing Pages"
   - [ ] API ID: "landing-pages"
   - [ ] Enable: Draftable, Publishable
   - [ ] Click "Save"

3. **Add Fields** (follow schema)
   - [ ] Title (String, required)
   - [ ] Slug (String, unique, required)
   - [ ] Variant (Enum: ads / social / default)
   - [ ] Hero Headline (String)
   - [ ] Hero Subheadline (String)
   - [ ] Hero CTA Text (String)
   - [ ] Hero CTA Link (String)
   - [ ] Hero Background Image (Media)
   - [ ] SEO (Component)
   - [ ] Blocks (Dynamic Zone)
   - [ ] Click "Save"

4. **Create Components**
   - [ ] Go to Components
   - [ ] Create each component:
     - [ ] `blocks.before-after-carousel`
     - [ ] `blocks.testimonial-section`
     - [ ] `blocks.process-steps`
     - [ ] `blocks.faq-accordion`
     - [ ] `blocks.quiz-section`
     - [ ] `blocks.results-showcase`
     - [ ] `blocks.limited-offer`

5. **Add Dynamic Zone to Collection**
   - [ ] Go to Landing Pages collection
   - [ ] Add field: "Blocks" (Dynamic Zone)
   - [ ] Select all components created above
   - [ ] Click "Save"

### Create Test Content
- [ ] **Entry 1: Lippen Aachen**
  - [ ] Title: "Lippen aufspritzen Aachen"
  - [ ] Slug: `lippen-aachen`
  - [ ] Variant: `ads`
  - [ ] Fill hero fields
  - [ ] Add blocks
  - [ ] Fill SEO
  - [ ] Click "Save"
  - [ ] Click "Publish"

- [ ] **Entry 2: Botox Zornesfalte**
  - [ ] Title: "Botox gegen Zornesfalte Köln"
  - [ ] Slug: `botox-zornesfalte-koeln`
  - [ ] Variant: `social`
  - [ ] Fill hero fields
  - [ ] Add blocks
  - [ ] Fill SEO
  - [ ] Click "Save"
  - [ ] Click "Publish"

### Test API
- [ ] Get all pages:
  ```bash
  curl "https://striking-bear-e5a15ddc94.strapiapp.com/api/landing-pages?populate=*"
  ```
- [ ] Response: 200 OK, data returns
- [ ] Get by slug:
  ```bash
  curl "https://striking-bear-e5a15ddc94.strapiapp.com/api/landing-pages?filters[slug][$eq]=lippen-aachen&populate=*"
  ```
- [ ] Response: 200 OK, correct entry

### Setup Webhook (Auto-Redeploy)
- [ ] In Strapi: Settings → Webhooks
- [ ] Add webhook:
  - [ ] URL: `https://api.vercel.com/v1/integrations/deploy/DEPLOY_HOOK_ID/ui8pcHaktB`
  - [ ] Events: Publish, Unpublish
  - [ ] Click "Save"
- [ ] Test: Publish an entry in Strapi
- [ ] Verify: Vercel redeploys (30 seconds)

### Frontend Integration
- [ ] Option 1: Use `StrapiLandingPage.vue` component
  ```vue
  <StrapiLandingPage slug="lippen-aachen" />
  ```
- [ ] Option 2: Use `useStrapiFetch()` in existing routes
  ```javascript
  const { data } = await useStrapiFetch('/landing-pages?populate=*');
  ```

### Deployment Checklist
- [ ] Strapi entries published
- [ ] API responding correctly
- [ ] Webhook configured
- [ ] Frontend component added to a page
- [ ] Vercel redeploy triggered

### Post-Deployment (10 mins)
- [ ] Test page loads from API
- [ ] Verify content displays correctly
- [ ] Check meta tags injected properly
- [ ] Run Lighthouse audit
- [ ] Test responsive design

### Launch Complete ✅
- [ ] Pages live and manageable via Strapi
- [ ] Content team can edit without code
- [ ] Publishing triggers auto-redeploy

---

## Hybrid Approach (Recommended)

### Deploy Both Options
- [ ] Follow **Option A** checklist for high-traffic pages
  - [ ] Lippen Aachen (established, ads-driven)
  - [ ] Botox Zornesfalte (proven social performer)

- [ ] Follow **Option B** checklist for experimental pages
  - [ ] New seasonal campaigns
  - [ ] A/B test variations
  - [ ] Rapid iteration pages

### Benefits
✅ Best performance for proven pages (Option A)  
✅ Fast iteration for experiments (Option B)  
✅ Marketing team independence (Option B)  
✅ Maximum scalability (both)

---

## Post-Launch Monitoring (Week 1)

### Day 1 (Launch Day)
- [ ] Monitor Vercel dashboard for errors
- [ ] Check browser console for JavaScript errors
- [ ] Verify Google Analytics events firing
- [ ] Test all CTA button conversions
- [ ] Check mobile view on real devices

### Days 2-3
- [ ] Monitor Lighthouse scores
- [ ] Review Core Web Vitals
- [ ] Check bounce rate
- [ ] Monitor conversion funnel
- [ ] Review Google Search Console

### Week 1 Summary
- [ ] Total visitors: ______
- [ ] Conversion rate: _____%
- [ ] Average bounce rate: _____%
- [ ] Average time on page: ______ seconds
- [ ] Top traffic source: ______________

### Issues Found & Resolved
- [ ] Issue 1: _________________ ✅ Fixed
- [ ] Issue 2: _________________ ✅ Fixed
- [ ] Issue 3: _________________ ✅ Fixed

---

## Success Criteria (First Month)

### Performance ✅
- [ ] Lighthouse Performance >90
- [ ] Lighthouse SEO >95
- [ ] Page load time <2.5s
- [ ] Mobile LCP <1.2s
- [ ] CLS <0.1 (no layout shift)

### User Experience ✅
- [ ] Bounce rate <45%
- [ ] Avg session duration >90 seconds
- [ ] Mobile usability score >90

### Conversions ✅
- [ ] Conversion rate >1.5%
- [ ] Form completion rate >40%
- [ ] Email signups >20/day
- [ ] Booking inquiries >5/week

### SEO ✅
- [ ] Indexed in Google Search Console
- [ ] Appears in search results
- [ ] Top 5 for target keywords
- [ ] Meta tags rendering correctly

---

## Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| Page not found (404) | See `docs/DEPLOYMENT_GUIDE.md` → Troubleshooting |
| Slow load (>3s) | Run Lighthouse audit, check images |
| Meta tags not showing | Verify meta tags in page source |
| Analytics not firing | Check console for errors, verify GA code |
| Mobile issues | Test on multiple devices, check viewport |
| Strapi API errors | Verify entry is published, check populate params |

---

## Emergency Rollback

### Option A (Nuxt)
```bash
git revert HEAD
git push origin main
# Vercel auto-deploys previous version
```

### Option B (Strapi)
1. Go to Strapi admin
2. Find problematic entry
3. Click "Unpublish"
4. Delete or edit content
5. Republish

---

## Final Validation

Before declaring "launch complete":

- [ ] All pages load without errors
- [ ] Responsive design verified on mobile
- [ ] Analytics tracking confirmed
- [ ] SEO meta tags verified
- [ ] Performance benchmarks met
- [ ] Conversion tracking working
- [ ] Team trained on next steps
- [ ] Monitoring dashboard set up
- [ ] Support contact assigned
- [ ] Launch announcement ready

---

## Sign-Off

- [ ] **Technical Lead:** __________________ Date: ______
- [ ] **Product Owner:** __________________ Date: ______
- [ ] **Marketing Lead:** _________________ Date: ______

---

**Status:** ✅ Ready to deploy!

**Questions?** See `docs/DEPLOYMENT_GUIDE.md` or contact b.roos@myhb.app

