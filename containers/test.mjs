import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';

const port = Number.parseInt(process.env.TEST_PORT || '18347', 10);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('TEST_PORT must be an integer between 1024 and 65535');
}

const serverPath = fileURLToPath(new URL('./server.mjs', import.meta.url));
const child = spawn(process.execPath, [serverPath], {
  cwd: process.cwd(),
  env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let stderr = '';
child.stderr.setEncoding('utf8').on('data', (chunk) => { stderr += chunk; });
const base = `http://127.0.0.1:${port}`;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`server exited early: ${stderr}`);
    try {
      const response = await fetch(`${base}/healthz`, { signal: AbortSignal.timeout(500) });
      if (response.status === 200) { ready = true; break; }
    } catch {}
    await delay(100);
  }
  assert.ok(ready, 'server should become ready');

  let response = await fetch(`${base}/healthz`);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'ok\n');
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');

  response = await fetch(`${base}/missing`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { ok: false, error: 'Not found' });

  response = await fetch(`${base}/healthz`, { method: 'POST' });
  assert.equal(response.status, 404);

  console.log(JSON.stringify({
    status: 'PASS',
    tests: 7,
    checks: ['startup', 'health status', 'health body', 'cache header', 'nosniff header', 'unknown route JSON 404', 'method restriction'],
  }, null, 2));
} finally {
  if (child.exitCode === null) {
    const exited = once(child, 'exit');
    child.kill('SIGTERM');
    await Promise.race([exited, delay(1500)]);
    if (child.exitCode === null) child.kill('SIGKILL');
  }
}
