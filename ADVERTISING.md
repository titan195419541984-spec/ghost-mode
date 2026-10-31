# Advertising — Ghost Mode

Production site: https://ghost-mode-umm5.onrender.com

## HilltopAds
A HilltopAds loader is installed at public/hilltop.js. It loads the supplied ad script from https://unrealistic-push.com. The loader is served from this site's own origin so the Content Security Policy does not need an inline-script exception. The CSP permits the supplied host for script, frame, and connection requests.

The HilltopAds verification meta tag supplied for this Ghost Mode site remains in public/index.html. If the HilltopAds dashboard requests an ads.txt seller record, add only the exact line supplied by that dashboard; do not guess or reuse another network's seller ID.

## Google AdSense
The site includes publisher verification for ca-pub-5558048915852406, and public/ads.txt contains:

    google.com, pub-5558048915852406, DIRECT, f08c47fec0942fa0

AdSense ad serving is disabled on the current Render deployment. Enable it only after Google approval, using ADS_ENABLED=true, AD_CLIENT_ID=ca-pub-5558048915852406, and real numeric ad-unit IDs for the placements. The module will not request ads without an enabled flag, valid publisher ID, and at least one numeric slot ID.

## Important
- Do not enable AdSense before approval.
- Do not invent ad-unit IDs or seller records.
- Do not reward points for ad clicks or unverified video completion.
- Rewarded video requires a provider completion callback and server-side verification; HilltopAds' current script integration does not provide that reward ledger.
