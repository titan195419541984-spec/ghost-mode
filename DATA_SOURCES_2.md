# Data Sources & Limitations — Ghost Mode

## Providers (server-side aggregation)

### 1. Google Trends RSS
- URL: https://trends.google.com/trending/rss?geo=US
- Supplies: trending search topics, title, link, pubDate.
- Limitation: US geo only, no engagement numbers, rate-limited, may return empty or block. No official API key required but subject to Google Terms. Treat as search interest, not virality.
- Timeout: 7s, parsed via regex, HTML stripped.

### 2. Hacker News (Algolia)
- URL: https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=50
- Supplies: title, url, points, num_comments, created_at.
- Limitation: tech-biased, engagement = points+comments. No auth required, respect Algolia rate limits.
- Timeout: 7s.

### 3. Mastodon Public Trends
- URL: https://mastodon.social/api/v1/trends/tags?limit=20
- Supplies: hashtag name, history uses.
- Limitation: single instance, not whole fediverse, hashtag only, uses sum as engagement proxy. Public, no auth.
- Timeout: 7s.

### 4. GDELT DOC 2.0
- URL: https://api.gdeltproject.org/api/v2/doc/doc?query=trending&mode=ArtList&maxrecords=25&format=json&sort=HybridRel
- Supplies: news article title, url, domain, seendate.
- Limitation: news-biased, query=trending is broad, may include irrelevant. No key, but rate-limited.
- Timeout: 7s, date parsed safely.

## Aggregation logic
- Fetch all in parallel with Promise.allSettled — one failure does not crash feed.
- Deduplicate by normalized URL.
- Cluster by heuristic topicKey: first 4 keywords sorted, lowercased, stopword-filtered.
- Scoring: scoreFor() = 32 + min(3,sourceCount-1)*10 + recency*20 + min(1, engagementNorm)*18 + rankBonus. Recency decays over 72h. Engagement log10 scaled. Scores 12-99.
- Momentum: >=78 Surging, >=60 Rising, else Early signal.
- Confidence: sourceCount>=3 High, 2 Moderate, 1 Limited.
- Caching: 3 min, stale cache served on failure if available.
- Sanitization: clean() strips tags and entities, safeURL validates http/https, no localhost, no trusted HTML rendering.
- Logging: privacy-conscious, no IP PII in body.

## What we DON'T claim
- No privileged access to TikTok, Instagram, YouTube, Reddit private analytics.
- Not real-time for platforms that don't provide it.
- No prediction of virality.
- Topic clustering heuristic imperfect.

## Credentials / approvals needed
None for current providers. If adding Reddit, Twitter/X, YouTube, TikTok, you need official API keys and must respect terms, rate limits, robots.txt.

## Future
Add source health metrics, per-source timeout tracking, circuit breaker after repeated failures.

