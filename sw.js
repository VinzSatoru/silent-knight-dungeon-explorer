const CACHE_NAME = 'silent-knight-v3';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/input.js',
    './js/physics.js',
    './js/environment.js',
    './js/entities.js',
    './js/main.js',
    './manifest.json',
    './assets/game_logo.jpg'
    // Aset lainnya akan secara otomatis di-cache saat di-request (lihat strategi fetch di bawah)
];

self.addEventListener('install', event => {
    // Skip waiting forces the waiting service worker to become the active service worker
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Hapus cache lama saat service worker baru aktif
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Jika ada di cache, kembalikan dari cache
            if (response) {
                return response;
            }
            // Jika tidak ada di cache, fetch dari network lalu simpan ke cache
            return fetch(event.request).then(
                function(networkResponse) {
                    // Cek jika response valid
                    if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse;
                    }
                    var responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                    .then(function(cache) {
                        // Jangan cache API calls jika ada, tapi untuk game static ini aman
                        cache.put(event.request, responseToCache);
                    });
                    return networkResponse;
                }
            );
        })
    );
});
