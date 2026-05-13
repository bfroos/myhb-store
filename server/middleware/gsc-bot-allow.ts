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
    // Remove restrictive headers for Google bots
    setResponseHeader(event, 'X-Robots-Tag', 'all');
    setResponseHeader(event, 'X-Google-Bot-Friendly', 'true');
    
    // Allow full access
    setResponseHeader(event, 'Access-Control-Allow-Origin', '*');
  }
});
