# Advertising — Ghost Mode

Production service: https://ghost-mode-umm5.onrender.com

## Current configuration

- The Monetag page script supplied for this site is present in `public/index.html`:
  - Script: `https://quge5.com/88/tag.min.js`
  - Zone: `305577`
- The matching Monetag verification meta tag is present in the document head.
- The service worker is a same-origin PWA cache only. It does not import an advertising provider's worker or grant ad-network verification.
- The previous service worker configuration referenced HilltopAds domain `3nbf4.com` and zone `12187189`. That did not match the Monetag configuration and has been removed from the application worker.
- Google AdSense is not enabled by this document. Do not mix its publisher record or approval status with Monetag.

## Verification still required

A script tag in the HTML proves only that the browser is instructed to load the tag. It does not prove the Monetag site/domain is approved, that an ad request is accepted, or that impressions are being recorded. Confirm the domain and zone status in the Monetag dashboard and inspect a real browser session for successful network requests and rendered placements.

## Rewards integrity

- Do not reward points for ad clicks.
- Do not award video points without a rewarded-video provider completion callback and server-side verification.
- The Monetag verification tag is not a rewarded-video completion callback and cannot authorize points.
