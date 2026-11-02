const CACHE='lingo-studio-shell-v2';
const SHELL=[
  '/studio-sites/manifest.webmanifest',
  '/studio-sites/assets/lingo-app-icon.svg',
  '/studio-sites/assets/asklingo-dock.css',
  '/studio-sites/assets/asklingo-dock.js'
];

function isStaticAsset(url) {
  return url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/studio-sites/assets/') ||
    url.pathname === '/manifest.webmanifest' ||
    url.pathname === '/studio-sites/manifest.webmanifest' ||
    url.pathname === '/pwa-register.js' ||
    url.pathname === '/studio-sites/pwa-register.js';
}

function isCacheable(request, response) {
  const url = new URL(request.url);
  const cacheControl = String(response.headers.get('cache-control') || '').toLowerCase();
  const vary = String(response.headers.get('vary') || '').trim();
  return request.method === 'GET' &&
    url.origin === self.location.origin &&
    isStaticAsset(url) &&
    !request.headers.has('authorization') &&
    !/no-store|private|no-cache/.test(cacheControl) &&
    vary !== '*' &&
    !response.headers.has('set-cookie') &&
    response.ok &&
    response.type === 'basic';
}

async function precachePublicAssets() {
  const cache = await caches.open(CACHE);
  await Promise.all(SHELL.map(async (path) => {
    const request = new Request(path, { method: 'GET', credentials: 'omit' });
    try {
      const response = await fetch(request);
      if (isCacheable(request, response)) await cache.put(request, response);
    } catch {
      // A missing optional asset must not prevent service-worker installation.
    }
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(precachePublicAssets().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('lingo-studio-shell-') && key !== CACHE)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (isCacheable(request, response)) {
        const cache = await caches.open(CACHE);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cache = await caches.open(CACHE);
      if (isStaticAsset(url)) {
        const cached = await cache.match(request);
        if (cached) return cached;
      }
      return new Response(
        '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LINGO Studio — Offline</title><main><h1>LINGO Studio — Offline</h1><p>You are offline. Reconnect to load live LINGOlegacy services.</p></main></html>',
        { status: 503, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } },
      );
    }
  })());
});
