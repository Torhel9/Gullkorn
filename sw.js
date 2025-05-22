const CACHE_NAME = 'gullkorn-cache-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './mine-gullkorn.html',
  './mine-gullkorn.js',
  './registrer.html',
  './script.js',
  './manifest.json',
  // legg til alle bilder/ikoner du bruker:
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
