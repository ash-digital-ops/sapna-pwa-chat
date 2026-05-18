const CACHE_NAME = 'sapna-pwa-chat-v1.0.1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  // ADD icon files and splash screenshots if present:
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/screenshot1.png'
  // More app assets can be added here
];

// Install: pre-cache static assets
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
});

// Activate: clean up old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: serve cached, try network, fallback to offline
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
      .then(response => response || fetch(event.request)
        .then(netRes => {
          // Optionally cache new GET requests
          if (netRes && netRes.status === 200) {
            const copy = netRes.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, copy));
          }
          return netRes;
        })
        .catch(_ => {
          // If request fails (offline), fallback to index.html for navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
          // Optionally fallback assets logic here
        })
      )
  );
});

// PWA update on controllerchange (recommended for best UX)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});