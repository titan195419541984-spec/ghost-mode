"use strict";

// Keep this namespace unique to the alternative service so activation never
// deletes caches belonging to another application on the same origin.
const CACHE_PREFIX = "ghost-mode-alt-";
const STATIC_CACHE = CACHE_PREFIX + "nexusflow-v5";
const API_CACHE = CACHE_PREFIX + "api-v5";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.json",
  "/icons/ghost.svg",
  "/icons/ghost-192.svg",
  "/icons/ghost-512.svg"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    // All precache entries are same-origin, required shell assets. Avoid
    // third-party URLs here: a failed external request would abort installation.
    await cache.addAll(STATIC_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => {
      const isOurs = key.startsWith(CACHE_PREFIX);
      const isCurrent = key === STATIC_CACHE || key === API_CACHE;
      return isOurs && !isCurrent ? caches.delete(key) : Promise.resolve(false);
    }));
    await self.clients.claim();
  })());
});

async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok && response.type === "basic") {
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({
      items: [],
      sources: [],
      offline: true,
      error: "Public signal feeds are unavailable while offline."
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store"
      }
    });
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(cacheFirst(request).catch(async () => {
      const cachedShell = await caches.match("/index.html");
      if (cachedShell) return cachedShell;
      const cachedRoot = await caches.match("/");
      if (cachedRoot) return cachedRoot;
      return new Response("NexusFlow is unavailable offline. Reconnect and reload.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" }
      });
    }));
    return;
  }

  if (["style", "script", "font", "image"].includes(request.destination)) {
    event.respondWith(cacheFirst(request));
  }
});
