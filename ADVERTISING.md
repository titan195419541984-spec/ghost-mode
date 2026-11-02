# Advertising — Ghost Mode

Production site: https://ghost-mode-umm5.onrender.com

## Current production state

- Google AdSense is disabled by default. Do not enable it until the site is approved and real numeric ad-unit IDs are configured.
- Ad containers are restricted to the live Pulse feed. Inactive placements are hidden and do not reserve screen space in Radar, Studio, or Rewards.
- The AdSense publisher record is present in `public/ads.txt` and `public/app-ads.txt`:
  
      google.com, pub-5558048915852406, DIRECT, f08c47fec0942fa0

- The HilltopAds verification meta tag is present in `public/index.html`. Verification metadata alone does not serve ads.
- A HilltopAds serving script is not present in the current production source. The exact provider script/zone code and any required seller record must come from the HilltopAds dashboard; do not invent them or reuse another site's code.

## Google AdSense

Enable only after Google approval, using:

- `ADS_ENABLED=true`
- `AD_CLIENT_ID=ca-pub-5558048915852406`
- Real numeric IDs for the configured Pulse placement(s): `AD_SLOT_PULSE_TOP` and/or `AD_SLOT_PULSE_MID`

The app will not request ads without the enabled flag, a valid publisher ID, and at least one numeric slot ID.

## Rewards and advertising integrity

- Do not reward points for ad clicks.
- Do not award video points without a rewarded-video provider completion callback and server-side verification.
- HilltopAds' verification tag is not a rewarded-video completion callback and cannot be used to authorize points.
