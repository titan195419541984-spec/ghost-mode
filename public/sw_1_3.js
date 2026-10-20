
const CACHE_NAME='ghost-mode-v1-2-1';
const SHELL=['/','/index.html','/styles.css','/app.js','/ads.js','/ghost.svg','/manifest.webmanifest'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.pathname.startsWith('/api/')) return; // never cache api
  if(url.pathname==='/ads.txt') return;
  if(e.request.mode==='navigate'){
    e.respondWith(fetch(e.request).catch(()=>caches.match('/index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=> cached || fetch(e.request).then(res=>{
    if(res.ok && e.request.method==='GET' && url.origin===self.location.origin){
      const clone=res.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
    }
    return res;
  }).catch(()=>cached)));
});
