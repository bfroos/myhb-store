# SEO Logo Update - TODO

## ⚠️ Nächster Schritt: Echtes Markenlogo für Schema.org

**Aktuell:** `/favicon/favicon.svg` (Sub-optimal für Schema.org)

**Benötigt:** Hochauflösendes MY HEALTH & BEAUTY Logo

### Anforderungen (Google Best Practices):

1. **Format:** PNG (mit transparentem Hintergrund) oder JPG
2. **Mindestgröße:** 112x112 Pixel
3. **Empfohlene Größe:** 600x60 Pixel (Landscape) oder 600x600 Pixel (Square)
4. **Seitenverhältnis:** 1:1 (Square) oder 10:1 (Wide Landscape)
5. **Dateigröße:** Unter 5 MB
6. **URL:** Absolut und öffentlich zugänglich

### Empfohlener Pfad:
```
/public/images/brand/my-health-beauty-logo.png
```

### Nach Upload:

1. Logo in `app.config.ts` anpassen:
```typescript
organization: {
  logo: {
    url: "/images/brand/my-health-beauty-logo.png",
    fallback: "https://www.myhealthandbeauty.com/images/brand/my-health-beauty-logo.png",
  },
}
```

2. Testen mit Google Rich Results Test
3. In Google Search Console prüfen

### Referenzen:
- [Google Logo Guidelines](https://developers.google.com/search/docs/appearance/structured-data/logo)
- [Schema.org Organization](https://schema.org/Organization)
