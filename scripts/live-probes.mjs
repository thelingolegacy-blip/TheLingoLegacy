const base = process.env.LIVE_BASE_URL || 'https://thelingolegacy.com';
const paths = (process.env.LIVE_PROBE_PATHS || '/|/healthz').split('|').filter(Boolean);
const timeoutMs = Number(process.env.LIVE_PROBE_TIMEOUT_MS || 10000);

const probe = async (path) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    const url = new URL(path, base);
    const response = await fetch(url, { signal: controller.signal, redirect: 'manual' });
    const contentType = response.headers.get('content-type') || '';
    const body = path === '/healthz' && response.ok ? (await response.text()).trim() : null;
    const bodyOk = path !== '/healthz' || body === 'ok';
    const status = response.ok && bodyOk ? 'PASS' : 'FAIL';
    return {
      path,
      expected: path === '/healthz' ? '200 + body ok' : '2xx',
      actual: response.status,
      contentType,
      body: body ?? undefined,
      latencyMs: Math.round(performance.now() - started),
      status,
    };
  } catch (error) {
    return { path, expected: path === '/healthz' ? '200 + body ok' : '2xx', actual: String(error?.message || error), latencyMs: Math.round(performance.now() - started), status: 'FAIL' };
  } finally { clearTimeout(timer); }
};

const probes = [];
for (const path of paths) probes.push(await probe(path));
const result = { gate: 'live-probes', base, timestamp: new Date().toISOString(), status: probes.every((p) => p.status === 'PASS') ? 'PASS' : 'FAIL', probes };
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exit(1);
