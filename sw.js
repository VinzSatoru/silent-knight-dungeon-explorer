const CACHE_NAME = 'silent-knight-v1';
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
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
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
