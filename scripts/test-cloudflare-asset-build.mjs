import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const timeoutMs = 45_000;
const deadline = Date.now() + timeoutMs;
const server = createServer();
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const address = server.address();
const port = address.port;
await new Promise((resolve) => server.close(resolve));

const child = spawn('npx', [
  '--yes', 'wrangler@4', 'dev', '--local', '--ip', '127.0.0.1',
  '--port', String(port), '--log-level', 'error',
], { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });

let output = '';
child.stdout.on('data', (chunk) => { output += chunk.toString(); });
child.stderr.on('data', (chunk) => { output += chunk.toString(); });
let childExit = null;
child.on('exit', (code, signal) => { childExit = { code, signal }; });

const base = `http://127.0.0.1:${port}`;
async function waitForServer() {
  while (Date.now() < deadline) {
    if (childExit) throw new Error(`Wrangler dev exited before readiness: ${JSON.stringify(childExit)}\n${output}`);
    try {
      const response = await fetch(`${base}/healthz`, { signal: AbortSignal.timeout(1500) });
      if (response.status === 200 && (await response.text()).trim() === 'ok') return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for local Wrangler Worker.\n${output}`);
}

const checks = [];
async function check(path, expectedStatus, label) {
  const response = await fetch(`${base}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(5000) });
  const record = { path, expectedStatus, actualStatus: response.status, pass: response.status === expectedStatus };
  checks.push(record);
  if (!record.pass) {
    const preview = (await response.text()).slice(0, 200);
    throw new Error(`${label}: expected HTTP ${expectedStatus}, got ${response.status}; body=${JSON.stringify(preview)}`);
  }
}

let failure = null;
try {
  await waitForServer();
  await check('/healthz', 200, 'Worker health');
  await check('/api/v1/platform/gates', 200, 'platform gates API');
  await check('/', 200, 'root application');
  for (const path of [
    '/worker.js',
    '/wrangler.jsonc',
    '/package.json',
    '/.assetsignore',
    '/scripts/deployment-preflight.mjs',
    '/scripts/write-quality-evidence.mjs',
    '/tests/worker-runtime.test.mjs',
    '/.github/workflows/prototype-quality.yml',
    '/ops/g02/diagnose-runner.sh',
  ]) {
    await check(path, 404, `public asset exclusion ${path}`);
  }
} catch (error) {
  failure = error;
} finally {
  child.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 5000)),
  ]);
}

const result = {
  gate: 'cloudflare-local-asset-publication',
  status: failure ? 'FAIL' : 'PASS',
  deploymentPerformed: false,
  productionMutationPerformed: false,
  server: 'Wrangler local Worker runtime with repository-root static assets',
  checks,
  failure: failure ? String(failure.message || failure) : null,
  diagnostics: failure ? output.slice(-8000) : undefined,
};
console.log(JSON.stringify(result, null, 2));
if (failure) process.exit(1);
