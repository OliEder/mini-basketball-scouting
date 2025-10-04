// Basketball Scouting App Service Worker
const CACHE_NAME = 'basketball-scouting-v1.2.0';
const APP_PREFIX = '/mini-basketball-scouting';

// Dateien die gecacht werden sollen
const CACHE_URLS = [
  APP_PREFIX + '/',
  APP_PREFIX + '/index.html',
  APP_PREFIX + '/style.css',
  APP_PREFIX + '/app.js',
  APP_PREFIX + '/manifest.json',
  APP_PREFIX + '/icon/web-app-manifest-192x192.png',
  APP_PREFIX + '/icon/web-app-manifest--512x512.png'
];

// Service Worker Installation
self.addEventListener('install', function(event) {
  console.log('[SW] Installing Service Worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .then(function() {
        console.log('[SW] Skip waiting');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// Service Worker Aktivierung
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating Service Worker');
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function(cacheName) {
              return cacheName.startsWith('basketball-scouting-') && cacheName !== CACHE_NAME;
            })
            .map(function(cacheName) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(function() {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// Fetch Event - Cache-First mit Network Fallback
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  if (event.request.url.indexOf('/mini-basketball-scouting') === -1) return;

  event.respondWith(
    caches.match(event.request)
      .then(function(cachedResponse) {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(function(networkResponse) {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              var responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(function(error) {
            console.log('[SW] Network failed:', error);

            if (event.request.destination === 'document') {
              return caches.match(APP_PREFIX + '/index.html');
            }

            throw error;
          });
      })
  );
});