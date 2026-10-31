# Ghost Mode — Internet Trend Intelligence v1.2.1

Ghost Mode is a mobile-first PWA for discovering emerging internet topics from public sources.

## Current features
- The Pulse: trend cards with source attribution, timestamps, Ghost Score, momentum, and source links.
- Trend Radar: visualization of current signals.
- The Underground: lower-scoring and single-source signals.
- Your Signal and Your Vault: locally saved interests and signal snapshots.
- Live news wire focused on culture, creators, technology, and the internet.
- Wikimedia Commons image lookup with attribution when a relevant image is available.
- PWA shell, responsive navigation, search, share, and offline fallback.

## Run locally
Requires Node.js 20 or later. Run npm start. Startup runs syntax checks and the Node test suite before starting the HTTP server.

Health: /api/health; trends: /api/trends; news: /api/news; config: /api/config.

## Production
The Render service is ghost-mode-umm5, connected to this repository's master branch. Render auto-deploys commits. Health endpoint: /api/health.

## Advertising
HilltopAds is loaded from a same-origin loader file and its host is allowed by the Content Security Policy. Google AdSense remains disabled unless the publisher account is approved and valid ad-unit IDs are configured. See ADVERTISING.md. public/ads.txt contains the Google publisher record pub-5558048915852406.

## Rewards and tiers
The intended verified-video reward is 5 points per completed video, capped at 40 points per day. Tier thresholds are 250, 450, 1,200, and 2,000 points. No points are issued until a rewarded-video provider and server-side completion verification are integrated. Production tier gating requires authenticated accounts and server-side storage; client-side point totals are not secure entitlements.

## Privacy and limitations
This release has no account system or analytics SDK. Saved signals and preferences are stored in localStorage. Trend scores summarize available public signals and are not predictions.
