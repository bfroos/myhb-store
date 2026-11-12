/**
 * GSC Bot Allow Middleware
 * 
 * Problem: Google Search Console Address Change Tool wird von Headers/Security blockiert
 * Lösung: Alle Google Verification Requests durchlassen
 * 
 * Created: 2026-05-13
 */

export default defineEventHandler((event) => {
  const userAgent = getHeader(event, 'user-agent') || '';
  
  // Google Search Console Validation User-Agents
  const gscAgents = [
    'Google-InspectionTool',
    'Google-Site-Verification',
    'Googlebot',
    'Googlebot-Image',
    'Googlebot-News',
    'AdsBot-Google',
    'Mediapartners-Google'
  ];
  
  const isGoogleBot = gscAgents.some(agent => userAgent.includes(agent));
  
  if (isGoogleBot) {
    // Kein X-Robots-Tag mehr setzen (12.11.2026): "all" hob auf go. (Ads)
    // fuer Google genau das noindex auf, das TSEO-10 dort verlangt, und landete
    // per ISR-Cache auch bei allen anderen Besuchern. Auf www ist "all" ohnehin
    // der Normalfall.
    setResponseHeader(event, 'X-Google-Bot-Friendly', 'true');
    
    // Allow full access
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*');
  }
});
