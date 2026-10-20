# Smoke-test checklist

Run `npm run check` to validate server and browser JS syntax.
Run `npm test` for sanity tests.

Run `npm start`, then verify:
- GET /api/health returns {ok:true, service:'ghost-mode', ...}
- GET / returns app shell
- GET /styles.css, /app.js, /ads.js, /manifest.webmanifest, /sw.js, /ghost.svg return 200
- GET /api/trends returns sources status for 4 providers, with caching
- GET /api/config returns adsEnabled false by default
- GET /ads.txt returns placeholder or configured content
- If live feeds unavailable, UI switches to illustrative demo cards labeled as demo, not live
- PWA installable check (Chrome DevTools Application > Manifest)
- Responsive: no horizontal overflow at 360px, 768px, 1200px
- Ad containers: when disabled, no network request to googlesyndication.com, placeholder visible, not covering nav
- Legal pages: #privacy, #terms, #contact, #ads route to views
- Keyboard: 1-5 switches views, / opens search, ESC closes modals
- Reduced-motion: animations disabled when prefers-reduced-motion

Provider failure test: disconnect internet or block external fetches, verify stale cache or demo fallback, no crash.
Input validation: try javascript: url in trend data — should be sanitized to #.
