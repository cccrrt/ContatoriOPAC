const CACHE_NAME = 'contatori-bncf-v2';
const ASSETS = [
    './',
    './index.html',
    'https://cdn.tailwindcss.com'
];

// Installazione: salva immediatamente index.html e Tailwind CSS nella cache del telefono
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled(
                ASSETS.map((url) => cache.add(url))
            );
        }).then(() => self.skipWaiting())
    );
});

// Attivazione: pulisce eventuali vecchie cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )).then(() => self.clients.claim())
    );
});

// Intercetta le richieste: serve prima dalla cache (istante e offline), poi aggiorna in background
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                if (networkResponse && networkResponse.ok) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return networkResponse;
            }).catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});