import assert from "node:assert/strict";
import test from "node:test";
import {
  createStackEngine,
  liveness,
  planGateTransition,
  publicManifest,
  readStackConfig,
  readiness,
  STACK_GATE_IDS,
} from "../../src/platform/stack-engine.mjs";

test("missing or invalid environment never defaults to production", () => {
  for (const env of [{}, { ENVIRONMENT: "prod" }, { ENVIRONMENT: "Production" }]) {
    const config = readStackConfig(env);
    assert.equal(config.valid, false);
    assert.equal(config.environment, null);
    assert.ok(Object.values(config.gates).every((gate) => gate.enabled === false));
  }
});

test("all gates default closed except none; real-value gate is policy-closed", () => {
  const config = readStackConfig({ ENVIRONMENT: "staging" });
  assert.equal(STACK_GATE_IDS.length, 8);
  assert.ok(Object.values(config.gates).every((gate) => gate.enabled === false));
  assert.equal(config.gates.real_value_rewards.reason, "POLICY_CLOSED");
});

test("only explicit true enables a gate in a valid environment", () => {
  const config = readStackConfig({
    ENVIRONMENT: "staging",
    GATE_PUBLIC_HQ: "true",
    GATE_DEMO_GAMEPLAY: true,
    GATE_REGISTERED_PLAY: "TRUE",
    GATE_REAL_VALUE_REWARDS: "true",
  });
  assert.equal(config.gates.public_hq.enabled, true);
  assert.equal(config.gates.demo_gameplay.enabled, true);
  assert.equal(config.gates.registered_play.enabled, false);
  assert.equal(config.gates.real_value_rewards.enabled, false);
});

test("liveness is independent of dependency health", () => {
  assert.deepEqual(liveness("v1.2.3"), {
    ok: true,
    status: "alive",
    version: "v1.2.3",
  });
});

test("readiness blocks on missing config and required dependencies", () => {
  const invalid = readiness({ config: readStackConfig({}), dependencies: {} });
  assert.equal(invalid.ok, false);
  assert.ok(invalid.blockers.includes("ENVIRONMENT_INVALID_OR_MISSING"));

  const config = readStackConfig({ ENVIRONMENT: "staging" });
  const down = readiness({
    config,
    dependencies: {
      d1: { required: true, status: "unavailable" },
      firebase: { required: true, status: "unconfigured" },
      analytics: { required: false, status: "unconfigured" },
    },
  });
  assert.equal(down.ok, false);
  assert.equal(down.checks[2].ready, true);
  assert.equal(down.blockers.length, 2);
});

test("optional unconfigured dependencies do not block readiness", () => {
  const config = readStackConfig({ ENVIRONMENT: "staging" });
  const result = readiness({
    config,
    dependencies: { analytics: { required: false, status: "unconfigured" } },
  });
  assert.equal(result.ok, true);
  assert.equal(result.status, "ready");
});

test("public manifest allowlists values and never leaks secret environment data", () => {
  const config = readStackConfig({
    ENVIRONMENT: "staging",
    STACK_ENGINE_VERSION: "2026.11.14",
    API_SECRET: "do-not-leak",
    GATE_PUBLIC_HQ: "true",
  });
  const manifest = publicManifest(config);
  const serialized = JSON.stringify(manifest);
  assert.equal(manifest.gates.public_hq, true);
  assert.equal(serialized.includes("do-not-leak"), false);
  assert.equal(manifest.policy.cashout, "CLOSED");
});

test("gate transition requires authorization, reason and expected version", () => {
  const current = { enabled: false, version: 4 };
  assert.equal(planGateTransition(current, {
    gate_id: "demo_gameplay", enabled: true, expected_version: 4,
    actor: "operator", reason: "approved staging test", authorized: false,
  }).code, "ADMIN_AUTH_REQUIRED");

  assert.equal(planGateTransition(current, {
    gate_id: "demo_gameplay", enabled: true, expected_version: 3,
    actor: "operator", reason: "approved staging test", authorized: true,
  }).code, "VERSION_CONFLICT");

  const result = planGateTransition(current, {
    gate_id: "demo_gameplay", enabled: true, expected_version: 4,
    actor: "operator", reason: "approved staging test", authorized: true,
  });
  assert.equal(result.ok, true);
  assert.equal(result.next.version, 5);
  assert.equal(result.audit.event, "STACK_GATE_TRANSITION");
});

test("real-value gate cannot be opened even with authorized transition", () => {
  const result = planGateTransition({ enabled: false, version: 1 }, {
    gate_id: "real_value_rewards", enabled: true, expected_version: 1,
    actor: "operator", reason: "legal approval received", authorized: true,
  });
  assert.equal(result.ok, false);
  assert.equal(result.code, "POLICY_CLOSED");
});

test("unknown gate IDs are rejected", () => {
  assert.equal(planGateTransition({ enabled: false, version: 1 }, {
    gate_id: "made_up", enabled: true, expected_version: 1,
    actor: "operator", reason: "test change", authorized: true,
  }).code, "UNKNOWN_GATE");
});

test("engine exposes deterministic liveness, readiness and manifest contracts", () => {
  const engine = createStackEngine({ ENVIRONMENT: "staging", STACK_ENGINE_VERSION: "0.1.0" });
  assert.equal(engine.liveness().status, "alive");
  assert.equal(engine.readiness({}).status, "ready");
  assert.equal(engine.manifest().version, "0.1.0");
});
