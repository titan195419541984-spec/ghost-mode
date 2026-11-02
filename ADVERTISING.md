# Advertising — Ghost Mode

Production site: https://ghost-mode-umm5.onrender.com

## Current production state

- Google AdSense is disabled by default. Do not enable it until the site is approved and real numeric ad-unit IDs are configured.
- Ad containers are restricted to the live Pulse feed. Inactive placements are hidden and do not reserve screen space in Radar, Studio, or Rewards.
- The AdSense publisher record is present in `public/ads.txt` and `public/app-ads.txt`:
  
      google.com, pub-5558048915852406, DIRECT, f08c47fec0942fa0

- The HilltopAds verification meta tag is present in `public/index.html`.
- One HilltopAds provider script supplied by the site owner is installed in a dedicated sponsored placement inside The Pulse feed. The supplied zone range is `7586785–7586789`; the provided snippet is included once, not duplicated five times.
- The script loads third-party JavaScript from `realisticreply.com`. Its exact ad format and runtime behavior are controlled by the provider; placement inside Pulse does not guarantee the provider cannot open a new tab or pop-under.
- No HilltopAds seller record has been added to `ads.txt` because no verified seller line was supplied. Add only the exact seller record shown in the HilltopAds dashboard, if HilltopAds requires one.

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
