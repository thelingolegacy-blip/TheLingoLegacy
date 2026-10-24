import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const registry = JSON.parse(readFileSync(new URL("../proposed-tracking-id-registry.json", import.meta.url), "utf8"));

test("tracking registry contains 25 unique, correctly formatted proposed IDs", () => {
  assert.equal(registry.entries.length, 25);
  const ids = registry.entries.map(entry => entry.proposed_tracking_id);
  assert.equal(new Set(ids).size, ids.length, "tracking IDs must be unique");
  for (const id of ids) assert.match(id, /^[a-f0-9]{16}$/);
});

test("tracking IDs cannot be mistaken for registered runner or agent identities", () => {
  assert.equal(registry.safety_status, "UNREGISTERED_UNVERIFIED");
  assert.equal(registry.production_authorization, "NONE");
  for (const entry of registry.entries) {
    assert.equal(entry.github_runner_id, null);
    assert.equal(entry.host_identity, null);
    assert.equal(entry.agent_or_bot_identity, null);
    assert.equal(entry.workflow_run_id, null);
    assert.equal(entry.status, "UNASSIGNED_UNVERIFIED");
  }
});
