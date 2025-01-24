const version = 'v132';  // change this everytime you update the service worker
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
    '/Trivia_Game/icons.json',
    '/Trivia_Game/index.html',
    '/Trivia_Game/manifest.json',
    '/Trivia_Game/myscript.js',
    '/Trivia_Game/style.css',
    '/Trivia_Game/icons/icon512_maskable.png',
    '/Trivia_Game/icons/icon512_rounded.png',
    '/Trivia_Game/images/0awkward.webp',
    '/Trivia_Game/images/0background.webp',
    '/Trivia_Game/images/0disappointed.webp',
    '/Trivia_Game/images/0flirtatious.webp',
    '/Trivia_Game/images/0flustered.webp',
    '/Trivia_Game/images/0impressed.webp',
    '/Trivia_Game/images/0rejected.webp',
    '/Trivia_Game/images/0resting.webp',
    '/Trivia_Game/images/0seduced.webp',
    '/Trivia_Game/images/0shy.webp',
    '/Trivia_Game/images/favicon.ico',
    '/Trivia_Game/images/getrizzy.webp',
    '/Trivia_Game/images/nopic.webp'
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
        alert("App is offline. Some features may not work.");
        console.log("App is offline. Some features may not work.");
        return caches.match(event.request);
      })
  );
});