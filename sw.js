// A service worker with a network-first caching strategy for updates.

const CACHE_NAME = 'storybook-generator-v4'; // Bumped version to invalidate old caches
const STATIC_ASSETS = [
  './',
  'index.html',
  'index.css',
  'index.tsx', // Add tsx file to cache for offline potential
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// On install, pre-cache the static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting(); // Force the waiting service worker to become the active service worker.
});

// On activate, remove old caches to avoid conflicts
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
        // Tell the active service worker to take control of the page immediately.
        return self.clients.claim();
    })
  );
});

// On fetch, use a network-first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    // Always try the network first
    fetch(event.request)
      .then(networkResponse => {
        // If we get a response, cache it and return it
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // If the network fails, try to serve from the cache
        return caches.match(event.request);
      })
  );
});
