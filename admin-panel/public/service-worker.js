const CACHE_NAME = 'crown-bingo-admin-v1';
const OFFLINE_URL = '/offline.html';
const STATIC_ASSETS = ['/', '/index.html', '/static/js/main.js', '/static/css/main.css'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS.concat(OFFLINE_URL)))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method === 'GET' && event.request.url.includes('/static/')) {
    event.respondWith(
      caches.match(event.request).then((r) => r || fetch(event.request).then((res) => {
        return caches.open(CACHE_NAME).then((cache) => { cache.put(event.request, res.clone()); return res; });
      }))
    );
    return;
  }
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).then((res) => {
        if (res.ok) { caches.open(CACHE_NAME).then((cache) => cache.put(event.request, res.clone())); }
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
