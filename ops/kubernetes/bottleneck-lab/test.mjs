import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { test } from "node:test";

test("capacity lab bounds injected parameters and rejects overflow", { timeout: 12000 }, async () => {
  const port = 18081;
  const base = `http://127.0.0.1:${port}`;
  const serverPath = new URL("./server.mjs", import.meta.url);
  const child = spawn(process.execPath, [serverPath.pathname], {
    env: {
      ...process.env,
      PORT: String(port),
      LAB_MODE: "true",
      MAX_IN_FLIGHT: "1",
      MAX_QUEUE: "0",
      MAX_DELAY_MS: "1000",
    },
    stdio: "ignore",
  });

  try {
    let ready = false;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      if (child.exitCode !== null) throw new Error(`server exited early with code ${child.exitCode}`);
      try {
        const response = await fetch(`${base}/healthz`);
        if (response.ok) {
          ready = true;
          break;
        }
      } catch {
        // The local test server may not have bound its port yet.
      }
      await sleep(100);
    }
    assert.equal(ready, true, "server should become healthy");

    const outOfBounds = await fetch(`${base}/simulate?delay_ms=1001&fail_rate=0`);
    assert.equal(outOfBounds.status, 400);

    const inFlight = fetch(`${base}/simulate?delay_ms=300&fail_rate=0`);
    await sleep(40);
    const overflow = await fetch(`${base}/simulate?delay_ms=0&fail_rate=0`);
    assert.equal(overflow.status, 429);
    assert.equal((await overflow.json()).error, "capacity_limit_reached");

    const completed = await inFlight;
    assert.equal(completed.status, 200);
    assert.equal((await completed.json()).ok, true);

    const metrics = await fetch(`${base}/metrics`);
    assert.equal(metrics.status, 200);
    assert.match(await metrics.text(), /lingo_lab_requests_rejected_total 1/);
  } finally {
    child.kill("SIGTERM");
    await Promise.race([new Promise((resolve) => child.once("exit", resolve)), sleep(1500)]);
    if (child.exitCode === null) child.kill("SIGKILL");
  }
});
