import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const script = readFileSync(new URL("../host-inspection-linux.sh", import.meta.url), "utf8");

test("host preflight includes the required read-only telemetry sections", () => {
  for (const section of [
    "HOST",
    "DISK SPACE",
    "MEMORY AND SWAP",
    "RUNNER PROCESSES (NO ARGUMENTS)",
    "RUNNER SERVICES",
    "DNS LOOKUP (NO AUTHENTICATED REQUESTS)"
  ]) {
    assert.ok(script.includes(section), "missing section: " + section);
  }
});

test("host preflight avoids runner, service, network, and DNS mutations", () => {
  assert.doesNotMatch(script, /config\.(sh|cmd)|--token|\b(systemctl|service)\s+(start|stop|restart|enable|disable)\b/i);
  assert.doesNotMatch(script, /\b(curl|wget)\b.*\b(POST|PUT|PATCH|DELETE)\b/i);
  assert.match(script, /ps -eo pid,ppid,stat,etime,comm\s*\\/);
  assert.match(script, /does not prove runner registration, assignment, or job execution/);
});
