const version = 'v131';  // change this everytime you update the service worker
                          // to force the browser to also update it.

/*self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('my-cache').then(function(cache) {
      return cache.addAll([
        '/',
        'icons.json',
        'index.html',
        'manifest.json',
        'myscript.js',
        'style.css',
        'icons/icon512_maskable.png',
        'icons/icon512_rounded.png',
        'images/0awkward.webp',
        'images/0background.jpg',
        'images/0disappointed.webp',
        'images/0flirtatious.webp',
        'images/0flustered.webp',
        'images/0impressed.webp',
        'images/0rejected.webp',
        'images/0resting.webp',
        'images/0seduced.webp',
        'images/0shy.webp'
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
    '/',
    'icons.json',
    'index.html',
    'manifest.json',
    'myscript.js',
    'style.css',
    'icons/icon512_maskable.png',
    'icons/icon512_rounded.png',
    'images/0awkward.webp',
    'images/0background.webp',
    'images/0disappointed.webp',
    'images/0flirtatious.webp',
    'images/0flustered.webp',
    'images/0impressed.webp',
    'images/0rejected.webp',
    'images/0resting.webp',
    'images/0seduced.webp',
    'images/0shy.webp',
    'images/favicon.ico',
    'images/getrizzy.webp',
    'images/nopic.webp'
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
        return caches.match(event.request);
      })
  );
});