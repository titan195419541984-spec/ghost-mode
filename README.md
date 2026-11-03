# Ghost Mode — Creator Trend Intelligence

Ghost Mode is a mobile-first creator intelligence workspace. The default landing view is the Creator Desk: a daily scan of emerging public signals, reusable storytelling structures, saved formats, and a practical hook generator.

## Creator Desk
- Morning scan of the current public topic-signal feed, with source attribution and timestamps.
- Eight reusable cross-niche storytelling structures: open-loop reveal, reverse-order reveal, visual proof, expectation vs. reality, three-beat escalation, overlooked detail, constraint challenge, and before/after with the why.
- A locally saved structure swipe file.
- A hook lab that generates three editable opening-hook directions from a topic and selected structure.
- A browser bookmarklet that captures a page title and URL into the Creator Desk workflow.
- Clear separation between public topic signals and verified short-form video performance data.

## Data integrity and current limitations
The live trend feed currently aggregates Google Trends RSS, Hacker News, Mastodon public trends, and public news RSS. It is refreshed by the existing server cache (default three minutes). This is a topic discovery feed, not a short-form video index.

The Creator Desk explicitly marks video-index coverage and creator baselines as not connected. It does not claim to have indexed millions of TikTok, Instagram Reels, or YouTube Shorts videos, nor does it manufacture creator-relative breakout scores. Those capabilities require a compliant video-level data provider and historical creator/niche performance observations. The current Ghost Score remains a directional score over available public topic signals; it is not a video virality prediction.

The format suggestions are editorial recommendations based on topic context. They are not represented as formats proven to be trending by video-level evidence.

## Existing discovery workspace
- The Pulse: public trend cards with source attribution, timestamps, Ghost Score, momentum, and source links.
- Trend Radar: visualization of current public signals.
- The Underground: lower-scoring and single-source signals.
- Your Signal and Your Vault: locally saved interests and signal snapshots.
- Live news wire focused on culture, creators, technology, and the internet.
- Wikimedia Commons image lookup with attribution when a relevant image is available.
- PWA shell, responsive navigation, search, share, and offline fallback.

## Ghost Studio
Ghost Studio turns a topic into a structured writing package: hook, script, scene plan, caption, and hashtags. It creates a local writing draft; it does not generate video footage, voice, music, or an exported MP4 in this release.

## Run locally
Requires Node.js 20 or later. Run `npm start`. Startup runs syntax checks and the Node test suite before starting the HTTP server.

Health: `/api/health`; trends: `/api/trends`; news: `/api/news`; config: `/api/config`.

## Production
The Render service is `ghost-mode-umm5`, connected to this repository's `master` branch. Render auto-deploys commits. Health endpoint: `/api/health`.

## Advertising and rewards
HilltopAds is loaded from a same-origin loader file. Google AdSense remains disabled unless the publisher account is approved and valid ad-unit IDs are configured. See `ADVERTISING.md`.

The intended verified-video reward is 5 points per completed video, capped at 40 points per day. Tier thresholds are 250, 450, 1,200, and 2,000 points. No points are issued until a rewarded-video provider and server-side completion verification are integrated. Production tier gating requires authenticated accounts and server-side storage; client-side point totals are not secure entitlements.

## Privacy
This release has no account system or analytics SDK. Saved signals, interests, and Creator Desk structures are stored in localStorage on the current device.
