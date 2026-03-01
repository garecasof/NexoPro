// NexoPro — Service Worker (PWA offline básico)
const CACHE_NAME = 'nexopro-v5'; // <-- Incrementado a v5 por el cambio a 3 columnas
const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/manifest.json'
];

// Install: cachear recursos esenciales y forzar instalación
self.addEventListener('install', (event) => {
    // skipWaiting() fuerza a este nuevo SW a activarse inmediatamente, 
    // reemplazando a cualquier SW viejo que estuviera en ejecución.
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(PRECACHE_URLS);
        })
    );
});

// Activate: limpiar caches viejos y tomar control inmediato
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
    // clients.claim() hace que el SW tome control de todas las páginas abiertas 
    // inmediatamente, sin esperar a un reload.
    self.clients.claim();
});

// Fetch: network-first con fallback a cache
self.addEventListener('fetch', (event) => {
    // Skip non-GET and external API requests
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('supabase.co')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone and cache successful responses
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(event.request);
            })
    );
});
