

const version = 'v125';  // change this everytime you update the service worker
                          // to force the browser to also update it.
/*
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('my-cache').then(function(cache) {
      return cache.addAll([
        '/',
        'index.html',
        'style.css',
        'apiexample.js',
        'manifest.json',
        'stars.jpg',
        'icons/icon-48-48.png',
        'icons/icon-72-72.png',
        'icons/icon-96-96.png',
        'icons/icon-144-144.png',
        'icons/icon-192-192.png',
        'icons/icon-512-512.png',
        'screenshots/screenshot1.png',
        'screenshots/screenshot2.png'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});*/

// Define cache names
const CACHE_NAME = 'my-app-cache-v1';
const DYNAMIC_CACHE_NAME = 'my-app-dynamic-cache-v1';

// Files to cache during install
const STATIC_ASSETS = [
    '/tvmaze2/',
    '/tvmaze2/index.html',
    '/tvmaze2/style.css',
    '/tvmaze2/apiexample.js',
    '/tvmaze2/manifest.json',
    '/tvmaze2/stars.jpg',
    '/tvmaze2/icons/icon-48-48.png',
    '/tvmaze2/icons/icon-72-72.png',
    '/tvmaze2/icons/icon-96-96.png',
    '/tvmaze2/icons/icon-144-144.png',
    '/tvmaze2/icons/icon-192-192.png',
    '/tvmaze2/icons/icon-512-512.png',
  // Add other static files you want to cache
];

// Install event: Cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME && cache !== DYNAMIC_CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

// Fetch event: Network-first strategy
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // If network fetch is successful, cache the response
        return caches.open(DYNAMIC_CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // If network fetch fails, fallback to cache
        console.log("wifi is needed to perform action")
        return caches.match(event.request);
      })
  );
});