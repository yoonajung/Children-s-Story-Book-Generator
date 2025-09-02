// A simple service worker for caching application assets

const CACHE_NAME = 'storybook-generator-v1';
const urlsToCache = [
  './',
  'index.html',
  'index.css',
  'index.tsx',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
