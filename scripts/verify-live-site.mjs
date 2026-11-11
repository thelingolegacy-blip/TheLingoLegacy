const base = (process.env.LINGO_SITE_BASE_URL || 'https://thelingolegacy.com').replace(/\/$/, '');
const failures = [];
const results = [];

async function check(path, expectedStatus = 200, validate) {
  const url = `${base}${path}`;
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000) });
    const body = await response.text();
    const item = { path, status: response.status, contentType: response.headers.get('content-type') || '' };
    if (response.status !== expectedStatus) failures.push(`${path}: expected HTTP ${expectedStatus}, received ${response.status}`);
    if (validate) {
      const problem = validate({ response, body, item });
      if (problem) failures.push(`${path}: ${problem}`);
    }
    results.push(item);
    return { response, body, item };
  } catch (error) {
    failures.push(`${path}: request failed: ${error.message}`);
    results.push({ path, error: error.message });
    return null;
  }
}

await check('/', 200, ({ body, item }) => {
  if (!item.contentType.includes('text/html')) return 'homepage did not return HTML';
  if (/Candidate experience/i.test(body)) return 'homepage still identifies itself as a candidate experience';
  return null;
});
await check('/healthz', 200, ({ body }) => body.trim() === 'ok' ? null : 'health response was not ok');
await check('/api/v1/runtime', 200, ({ body }) => {
  try {
    const data = JSON.parse(body);
    if (data.ok !== true) return 'runtime manifest did not report ok=true';
    if (data.integrations?.firebase !== true) return 'Firebase integration is not active';
    return null;
  } catch {
    return 'runtime endpoint did not return valid JSON';
  }
});
await check('/api/v1/platform/status', 200, ({ body }) => {
  try {
    const data = JSON.parse(body);
    if (data.status !== 'SERVING / RELEASE-LOCKED') return 'unexpected release status';
    if (data.production_mutation !== 'FROZEN') return 'production mutation is not frozen';
    if (data.lkg !== 'PROTECTED') return 'last-known-good is not protected';
    return null;
  } catch {
    return 'platform status endpoint did not return valid JSON';
  }
});
await check('/api/v1/platform/gates', 200, ({ body }) => {
  try {
    const data = JSON.parse(body);
    if (data.fail_closed !== true || data.mutation_freeze !== true) return 'release gate response did not preserve fail-closed controls';
    return null;
  } catch {
    return 'platform gates endpoint did not return valid JSON';
  }
});
for (const path of ['/studio-sites/', '/thats-my-lingo/', '/kottons-code/', '/ai/', '/studio-hub/']) {
  await check(path, 200, ({ item }) => item.contentType.includes('text/html') ? null : 'route did not return HTML');
}
const checkout = await fetch(`${base}/api/create-checkout-session`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: '{}',
  redirect: 'manual',
  signal: AbortSignal.timeout(15000),
}).catch((error) => {
  failures.push(`/api/create-checkout-session: request failed: ${error.message}`);
  return null;
});
if (checkout) {
  const body = await checkout.text();
  if (checkout.status !== 410) failures.push(`checkout safety control: expected HTTP 410, received ${checkout.status}`);
  if (!body.includes('BILLING_DISABLED')) failures.push('checkout safety control did not return BILLING_DISABLED');
  results.push({ path: '/api/create-checkout-session [POST]', status: checkout.status });
}

const www = await fetch('https://www.thelingolegacy.com/', { redirect: 'manual', signal: AbortSignal.timeout(15000) }).catch((error) => {
  failures.push(`www canonical host: request failed: ${error.message}`);
  return null;
});
if (www) {
  if (![301, 308].includes(www.status)) failures.push(`www canonical host: expected 301/308, received ${www.status}`);
  results.push({ path: 'https://www.thelingolegacy.com/', status: www.status, location: www.headers.get('location') || '' });
}

for (const result of results) process.stdout.write(`SITE_CHECK ${JSON.stringify(result)}\n`);
if (failures.length) {
  process.stderr.write(`SITE_ACCEPTANCE=BLOCKED failures=${failures.length}\n`);
  for (const failure of failures) process.stderr.write(`BLOCKER ${failure}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write('SITE_ACCEPTANCE=PASS\n');
}
