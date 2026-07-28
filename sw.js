const CACHE_NAME = 'lingo-legacy-shell-v1';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/thats-my-lingo-mark.svg',
  '/assets/logo-horizontal.svg',
  '/assets/lingo-os.css',
  '/assets/lingo-os.js',
  '/assets/studio-grade.css',
  '/assets/studio-grade.js',
  '/trust-compliance/',
  '/thats-my-lingo/',
  '/kottons-code/',
  '/loyalty-lane-cycles/',
  '/admin-command-center/',
  '/landing/',
  '/studio-assets/',
  '/studio-production/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(SHELL_ASSETS.map((asset) => cache.add(asset))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      const copy = response.clone();
      if (response.ok && new URL(request.url).origin === self.location.origin) {
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(() => {
      if (request.mode === 'navigate') return caches.match('/index.html');
      return new Response('', { status: 503, statusText: 'Offline' });
    }))
  );
});
