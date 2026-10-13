addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  const routes = {
    '/': 'https://thelingolegacy.com/',
    '/thats-my-lingo/': 'https://thelingolegacy.com/thats-my-lingo/',
    '/kottons-code/': 'https://thelingolegacy.com/kottons-code/',
    '/dice-shift-hotel/': 'https://thelingolegacy.com/dice-shift-hotel/',
    '/loyalty-lane-apparel/': 'https://thelingolegacy.com/loyalty-lane-apparel/',
    '/loyalty-lane-cycle/': 'https://thelingolegacy.com/loyalty-lane-cycle/',
    '/admin-command-center/': 'https://thelingolegacy.com/admin-command-center/',
    '/trust-compliance/': 'https://thelingolegacy.com/trust-compliance/',
    '/lingo-world/': 'https://thelingolegacy.com/lingo-world/'
  };

  const directTarget = routes[path] || null;

  if (directTarget) {
    return fetch(directTarget, {
      headers: {
        'x-lingo-route': 'cloudflare-worker'
      }
    });
  }

  // Default route: pass through to origin with edge caching headers
  return fetch(request, {
    cf: {
      cacheEverything: true,
      cacheTtl: 300,
      polish: 'lossless'
    }
  });
}
