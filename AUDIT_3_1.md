# Audit Report — Ghost Mode v1.2.0 Original

Date: 2026-10-20

## What currently works (verified in supplied files)
- Node.js server using native http, no deps, binds 0.0.0.0:PORT
- Aggregation: Google Trends RSS, Hacker News Algolia, Mastodon tags, GDELT — parallel with allSettled, 6.5s timeout, basic cache 3min
- Deduplication by URL lowercased, topic clustering heuristic
- Scoring: recency + engagement + source overlap
- Health endpoint /api/health returns ok true
- Trends endpoint /api/trends returns sources status, notice, cached flag
- Frontend: five views (Pulse, Radar, Underground, Signal, Vault), search, category filters, sorting, grid/list, detail modal, share (navigator.share + clipboard), localStorage save/interests, PWA manifest + sw.js (versioned shell), responsive dark UI with violet/cyan, mobile menu, keyboard shortcuts
- Render.yaml present, build/start/healthCheckPath correct

## What is incomplete or broken
- No public/ folder in supplied ZIP — server expects public/ but files were flat, causing 404 for all assets until fixed
- Missing styles.css, manifest.webmanifest, sw.js, ghost.svg in upload (referenced but absent)
- No ads module — only placeholder reserved area, no configurable enable/disable, no ads.txt route, no CSP handling for AdSense
- No legal pages (privacy, terms, contact, ads disclosure) — required for AdSense approval and public launch
- Radar visualization was decorative only, not data-driven in original
- Underground filtering existed but not explicitly tied to Early signal logic
- No rate limiting, no security headers beyond nosniff, no URL validation beyond try-catch, no response size cap
- No offline handling, no stale-cache fallback UI, no empty/error states fully differentiated
- No /api/config for ad enablement, no /ads.txt route
- No test suite beyond npm check
- No .env.example
- No documentation of data source limitations, ad setup, deployment env vars

## What is unsafe or insecure
- Original server allowed any path via normalize but did not fully prevent traversal edge cases; now fixed with replace
- No rate limiting — vulnerable to abuse of /api/trends which triggers external fetches
- External feed content rendered via clean() but no explicit safe URL validation for localhost or javascript: — now fixed
- No CSP, X-Frame-Options, Permissions-Policy — added
- No response size cap — added 1MB cap
- Logging could leak if IP logged with PII — kept privacy-conscious (method/path/status/duration only)

## What is needed before public launch
- Restore public/ assets and ensure all routes serve correctly
- Implement ads module with placeholders, disabled by default, ads.txt, CSP
- Add legal pages with placeholders for CONTACT_EMAIL, SITE_URL
- Add security headers, rate limiting, URL validation
- Add radar data visualization, underground filtering, proper empty/offline states
- Add README, DATA_SOURCES, ADVERTISING, DEPLOYMENT, .env.example
- Run syntax checks and endpoint tests
- Verify PWA installable, no horizontal overflow, all buttons functional

## What needs external credentials or approval
- AdSense: publisher ID ca-pub-..., ad unit IDs, site verification, human review, ads.txt — requires Google account, HTTPS domain
- No API keys needed for current 4 public sources, but if adding Reddit/YouTube/Twitter, need official API keys
- No database needed for v1.2.0 (localStorage), but future accounts would need PostgreSQL and auth secrets
