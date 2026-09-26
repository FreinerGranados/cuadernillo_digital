const CACHE_NAME = 'fisica3-notebook-v2';
const ASSETS_TO_CACHE = [
  './',
  '../pages/index.html',
  '../pages/cuadernillo.html',
  '../pages/shm-graphs.html',
  '../css/landing.css',
  '../css/main.css',
  '../css/geogebra.css',
  '../css/simulations.css',
  '../css/simulations-taller.css',
  '../css/shm-graphs.css',
  './app.js',
  './geogebra-engine.js',
  './physics-simulator.js',
  './mindmap.js',
  './shm-graphs.js',
  '../imagenes/portada.webp'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        return caches.match('../pages/index.html');
      });
    })
  );
});
