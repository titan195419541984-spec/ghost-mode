# Deployment Guide — Render

## Prerequisites
- Node.js >=20 locally for testing.
- Git repo with this folder as root.
- Render account.

## Steps
1. Push code to GitHub.
2. In Render dashboard: New + → Web Service → Connect repo.
3. Settings:
   - Name: ghost-mode
   - Runtime: Node
   - Build Command: npm install
   - Start Command: npm start
   - Health Check Path: /api/health
   - Plan: Free (or Starter for no spin-down)
   - Node version: 20 (engines field enforces)
4. Environment:
   - NODE_ENV=production
   - CACHE_MS=180000
   - ADS_ENABLED=false (until AdSense approved)
   - AD_CLIENT_ID (sync false, set after approval)
   - ADS_TXT_CONTENT (sync false)
   - SITE_URL=https://your-domain
   - CONTACT_EMAIL
   - PORT auto-provided by Render (server binds 0.0.0.0:PORT)
5. Deploy. First deploy may take 2-3 min. Free instance spins down after 15 min idle; first request after idle may be slow.
6. Verify:
   - https://your-service.onrender.com/api/health → {ok:true}
   - /api/trends → trends + sources
   - / → app shell loads, no 404 for /styles.css /app.js /manifest.webmanifest /sw.js /ghost.svg
   - /ads.txt → configured content
   - PWA installable (Chrome DevTools → Application → Manifest)

## Static assets
All public files served from public/ with mime types, security headers, cache-control (no-cache for html, 1h for assets). SPA fallback for routes without extension.

## Database
Not required for v1.2.0 — uses localStorage. If adding accounts, add PostgreSQL service in Render and update server.js to use persistent DB, hashed passwords, sessions, rate limits.

## Secrets
Never commit .env. Use Render env var dashboard. .env.example contains placeholders only.

## Logs
Server logs method path status duration + cache/fresh/stale tag. No IP PII. Check Render logs for errors.

## Rollback
Render keeps previous deploys — use Manual Deploy → previous commit if needed.
