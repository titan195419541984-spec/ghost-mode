# Ghost Mode — Signal Intelligence v1.2.0

Premium, futuristic, mobile-first trend-intelligence PWA.

## What it does
- **The Pulse**: continuously refreshable trend feed with titles, source attribution, timestamps, links, momentum, confidence, filtering, sorting, loading/empty/stale/error states. No fabricated live stats.
- **Trend Radar**: functional visualization based on real trend data, accessible labels, mobile layout, honest Ghost Score explanation.
- **The Underground**: early signals (score <70 or single-source) only when data justifies. Shows source coverage limitations.
- **Your Signal**: choose topics, personalize via localStorage, controls to change/clear.
- **Your Vault**: save/unsave, local persistence, preserved across refreshes, clear explanation of storage.
- **Sharing**: native share where supported, clipboard fallback, shareable summary with source link + Ghost Mode branding, no fake social network.
- **Navigation**: all buttons work, no dead links, no horizontal overflow, loading/empty/offline/failure states, accessible contrast, keyboard nav (1-5, /, ESC), reduced-motion support.

## Run locally
Requires Node.js 20+.

```bash
npm start
# or
PORT=3000 npm start
```
Open http://localhost:3000
Health: /api/health
Trends: /api/trends
Config: /api/config
ads.txt: /ads.txt

## Deploy on Render
1. Push to Git repo.
2. Create Web Service, root = repo root, runtime Node.
3. Build: npm install, Start: npm start, HealthCheck: /api/health
4. Set env vars from .env.example (ADS_ENABLED=false until approved).
`render.yaml` included.

## Android PWA
Host over HTTPS, open in Chrome, Install app / Add to Home screen. Not a native APK.

## Security basics
- No secrets in client.
- URL validation, HTML sanitization (no trusted HTML from feeds).
- Rate limiting (120/min per IP), timeouts, response size cap.
- Security headers: nosniff, DENY framing, strict-origin-when-cross-origin, CSP allowing self + AdSense when enabled, permissions-policy.
- Privacy-conscious logs (no IP logged with PII, just method/path/status/duration).

## Ads
See ADVERTISING.md. Disabled by default. No fake impressions. Reserved containers never cover nav/content.

## Legal
Privacy, Terms, Contact, Ads pages are SPA routes (#privacy etc) with placeholders for CONTACT_EMAIL, SITE_URL. Replace before launch.

## Data sources
See DATA_SOURCES.md for provider details, limitations, credentials.

## Testing
See TESTING.md and TEST_REPORT.md
