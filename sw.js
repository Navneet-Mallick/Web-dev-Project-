/**
 * Service Worker - Offline Support & Caching Strategy
 * Cache-first for assets, network-first for HTML
 * Auto-incrementing cache version to prevent stale content
 */

// Bump this manually whenever you deploy fixes
const CACHE_VERSION = 'v' + Math.floor(Date.now() / (1000 * 60 * 60 * 24)) + '-r5';
const CACHE_NAME = `portfolio-${CACHE_VERSION}`;

// On install — skip waiting immediately so new SW takes over right away
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/CSS/style.css',
        '/CSS/mobile.css',
        '/Assets/images/logo.png',
        '/Assets/images/profile.jpg'
      ]).catch(() => {});
    })
  );
});

// On activate — delete ALL old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

// Fetch — network first for everything, fall back to cache
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
