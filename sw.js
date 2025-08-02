// sw.js
const CACHE_NAME = 'plume-calculator-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/src/app.js',
    '/src/api.js',
    '/src/worker.js',
    '/src/chart.js',
    '/src/utils.js',
    '/src/cache.js',
    '/src/history.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
