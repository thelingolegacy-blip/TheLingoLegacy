const base = process.env.LIVE_BASE_URL || 'https://thelingolegacy.com';
const paths = (process.env.LIVE_PROBE_PATHS || '/|/healthz').split('|').filter(Boolean);
const timeoutMs = Number(process.env.LIVE_PROBE_TIMEOUT_MS || 10000);

const probe = async (path) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();
  try {
    const response = await fetch(new URL(path, base), { signal: controller.signal, redirect: 'manual' });
    return { path, expected: '2xx', actual: response.status, latencyMs: Math.round(performance.now() - started), status: response.ok ? 'PASS' : 'FAIL' };
  } catch (error) {
    return { path, expected: '2xx', actual: String(error?.message || error), latencyMs: Math.round(performance.now() - started), status: 'FAIL' };
  } finally { clearTimeout(timer); }
};

const probes = [];
for (const path of paths) probes.push(await probe(path));
const result = { gate: 'live-probes', base, timestamp: new Date().toISOString(), status: probes.every((p) => p.status === 'PASS') ? 'PASS' : 'FAIL', probes };
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASS') process.exit(1);
