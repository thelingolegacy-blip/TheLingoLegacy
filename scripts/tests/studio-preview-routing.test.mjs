import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Exercise the actual staging Worker module without external services or credentials.
const source = await readFile(
  new URL('../../cloudflare/workers/lingo-studio-control-center-staging.js', import.meta.url),
  'utf8',
);
const { default: worker } = await import(
  'data:text/javascript;base64,' + Buffer.from(source).toString('base64'),
);

const originalFetch = globalThis.fetch;
const upstreamRequests = [];
globalThis.fetch = async request => {
  const url = request instanceof Request ? request.url : String(request);
  const method = request instanceof Request ? request.method : 'GET';
  upstreamRequests.push({ url, method });

  if (url.endsWith('/redirect.js')) {
    return new Response(null, {
      status: 302,
      headers: { location: 'https://external.example/redirect-target.js' },
    });
  }

  return new Response('UPSTREAM_OK', {
    status: 200,
    headers: {
      'content-type': url.endsWith('.json') ? 'application/json' : 'application/javascript',
      'set-cookie': 'origin-session=must-not-leak',
      server: 'origin-server',
    },
  });
};

async function send(path, method = 'GET') {
  return worker.fetch(new Request('https://studio-preview.thelingolegacy.com' + path, { method }));
}

try {
  const staticBundle = await send('/_next/static/chunks/main.js');
  assert.equal(staticBundle.status, 200);
  assert.equal(
    upstreamRequests.at(-1).url,
    'https://lingolegacy-universe-gateway-h6kqu4.v2.appdeploy.ai/_next/static/chunks/main.js',
  );
  assert.equal(staticBundle.headers.get('set-cookie'), null);
  assert.equal(staticBundle.headers.get('server'), null);

  const studioData = await send('/_next/data/build123/studio.json?slug=studio');
  assert.equal(studioData.status, 200);
  assert.equal(
    upstreamRequests.at(-1).url,
    'https://lingolegacy-universe-gateway-h6kqu4.v2.appdeploy.ai/_next/data/build123/studio.json?slug=studio',
  );

  const legacyData = await send('/_next/data/build123/legacy.json?slug=legacy');
  assert.equal(legacyData.status, 200);

  const callsBeforeDenied = upstreamRequests.length;
  for (const path of [
    '/_next/data/build123/admin.json?slug=admin',
    '/_next/data/build123/studio.json?slug=legacy',
    '/_next/data/build123/studio.json?slug=studio&extra=1',
    '/_next/data/build123/studio.json?slug=studio&slug=studio',
    '/_next/data/build123/studio.json',
  ]) {
    const denied = await send(path);
    assert.equal(denied.status, 403, 'unapproved static data path must be denied: ' + path);
  }
  assert.equal(upstreamRequests.length, callsBeforeDenied, 'denied data paths must not reach an origin');

  const kottonImage = await send('/resources/KottonsCode-world-2.jpeg');
  assert.equal(kottonImage.status, 200);
  assert.equal(
    upstreamRequests.at(-1).url,
    'https://kotton-s-code-cartoon-studio-509py3.v2.appdeploy.ai/resources/KottonsCode-world-2.jpeg',
  );

  const imageOptimization = await send('/_next/image?url=%2Flogo.png');
  assert.equal(imageOptimization.status, 403);

  const protectedApi = await send('/api/runtime/probe/test');
  assert.equal(protectedApi.status, 403);

  const appPrefixedApi = await send('/apps/runtime/api/runtime/probe/test');
  assert.equal(appPrefixedApi.status, 403);

  const appPrefixedData = await send('/apps/universe/_next/data/build123/studio.json?slug=studio');
  assert.equal(appPrefixedData.status, 403);

  const redirect = await send('/_next/static/chunks/redirect.js');
  assert.equal(redirect.status, 502, 'external static-asset redirects must be blocked');

  const post = await send('/_next/static/chunks/main.js', 'POST');
  assert.equal(post.status, 405, 'the preview gateway must remain GET/HEAD only');

  console.log('STUDIO_PREVIEW_ROOT_STATIC_ASSETS=PASS');
  console.log('STUDIO_PREVIEW_STATIC_DATA_ALLOWLIST=PASS');
  console.log('STUDIO_PREVIEW_PROTECTED_PATHS=PASS');
  console.log('STUDIO_PREVIEW_REDIRECT_BLOCK=PASS');
  console.log('STUDIO_PREVIEW_GET_HEAD_ONLY=PASS');
} finally {
  globalThis.fetch = originalFetch;
}
