# Advertising Setup — Ghost Mode (PWA Web)

Ghost Mode is a web PWA, not native Android, so use **Google AdSense for web**, not AdMob SDK.

## Current implementation
- Configurable module: public/ads.js, enabled via /api/config which reads env ADS_ENABLED and AD_CLIENT_ID.
- Ad containers: .ad-container reserved in Pulse (top, mid), Radar, Underground, Detail modal. CSS min-height 90px, dashed border when disabled, never overlay nav/trend cards.
- No fake ads: when ADS_ENABLED=false, containers show placeholder text "Ad space reserved. No ad requests" and no AdSense script loaded. No fake impressions.
- When enabled: loads https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-... async, then pushes ins.adsbygoogle.
- ads.txt: server serves /ads.txt and /.well-known/ads.txt from env ADS_TXT_CONTENT, or generates from AD_CLIENT_ID if present. Required for AdSense verification.
- CSP: allows script-src self + https://pagead2.googlesyndication.com https://*.googlesyndication.com https://fundingchoicesmessages.google.com; frame-src https://*.googlesyndication.com https://googleads.g.doubleclick.net; connect-src self https://pagead2.googlesyndication.com
- Privacy: ads disabled in local dev and tests by default (ADS_ENABLED=false). Consent handling placeholder — integrate Google Funding Choices where required.

## Steps to activate real ads
1. Create Google AdSense account at https://adsense.google.com, add your site SITE_URL.
2. Verify site ownership: add AdSense script or meta, and ensure site reachable over HTTPS.
3. Wait for human review — approval not guaranteed. No earnings until approved.
4. After approval, get publisher ID ca-pub-XXXXXXXXXXXXXXXX.
5. Create ad units in AdSense dashboard for each placement, note data-ad-slot IDs.
6. Set env vars in Render dashboard:
   ADS_ENABLED=true
   AD_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
   AD_SLOT_PULSE_TOP=XXXXXXXXXX
   AD_SLOT_PULSE_MID=XXXXXXXXXX
   AD_SLOT_RADAR=XXXXXXXXXX
   AD_SLOT_UNDERGROUND=XXXXXXXXXX
   ADS_TXT_CONTENT="google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0"
   SITE_URL=https://yourdomain.com
7. Ensure /ads.txt accessible publicly and matches AdSense account.
8. Deploy, then verify in browser: ad containers should have data-enabled=true, script loaded, no console errors, ads render (may take hours).
9. Add cookie/consent disclosure to Privacy page, and implement Funding Choices if serving EEA/UK.

## Safety rules enforced
- No forced clicks, accidental-click designs, deceptive close buttons, popups, or ads disguised as navigation.
- Spacing min 90px, max responsive, no layout shift covering content.
- No ads on privacy-sensitive account/auth/consent screens (we have none in this build, but rule preserved).
- Disable ad requests in local dev/tests.

## Blockers requiring your action
- AdSense account approval (human review)
- Real publisher ID and ad-unit IDs (placeholders not valid)
- Domain HTTPS + privacy policy + terms + contact pages (implemented with placeholders, replace before submission)
- Consent management for applicable jurisdictions

ads.txt alone does NOT mean approved. You must complete verification and approval.
