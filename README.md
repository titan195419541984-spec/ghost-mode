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
The live trend feed currently aggregates Google Trends RSS, Hacker News, Mastodon public trends, and public news RSS. It is refreshed by the existing server cache (default three minutes). The optional YouTube video sample is cached for three hours by default. Set `YOUTUBE_API_KEY` on the Render service to enable it. This is a topic discovery feed, not a short-form video index.

An optional official YouTube Data API connector is implemented behind the `YOUTUBE_API_KEY` environment variable. When configured, it samples recent public Shorts and compares each video's average views per hour since publication with the channel's recent Shorts and the sampled YouTube category median. It only publishes a baseline-relative score when minimum sample thresholds are met; otherwise it labels the baseline as insufficient. Without the key, video coverage and baseline scoring remain unavailable. This is a limited YouTube sample, not a platform-wide census or a millions-of-videos index. TikTok and Instagram video metrics are not connected. The current Ghost Score remains a separate directional score over public topic signals; it is not a video virality prediction.

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

Health: `/api/health`; trends: `/api/trends`; video sample: `/api/videos`; news: `/api/news`; config: `/api/config`.

## Production
The Render service is `ghost-mode-umm5`, connected to this repository's `master` branch. Render auto-deploys commits. Health endpoint: `/api/health`.

## Advertising and rewards
Monetag's owner-supplied page tag (zone `305577`) and verification meta tag are included in `public/index.html`. The service worker is a same-origin PWA cache and does not load a third-party ad-network worker. Actual domain approval, ad delivery, and recorded impressions must still be verified in the Monetag dashboard. See `ADVERTISING.md`.

The intended verified-video reward is 5 points per completed video, capped at 40 points per day. Tier thresholds are 250, 450, 1,200, and 2,000 points. No points are issued until a rewarded-video provider and server-side completion verification are integrated. Production tier gating requires authenticated accounts and server-side storage; client-side point totals are not secure entitlements.

## Privacy
This release has no account system or analytics SDK. Saved signals, interests, and Creator Desk structures are stored in localStorage on the current device.
