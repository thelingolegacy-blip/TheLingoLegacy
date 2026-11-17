import test from "node:test";
import assert from "node:assert/strict";
import { authorizeTool, routeTask, ROUTER_VERSION } from "../src/router.mjs";

test("routes each declared task type to its logical agent", () => {
  const cases = [
    ["fast_support", "instant-ai"],
    ["complex_reasoning", "thinking-ai"],
    ["creative", "sol"],
    ["infrastructure", "terra"],
    ["research_verification", "luna"],
    ["coordination", "eliza"],
  ];

  for (const [taskType, agent] of cases) {
    assert.deepEqual(routeTask({ taskType, taskId: "test-1" }), {
      status: "routed",
      agent,
      taskType,
      taskId: "test-1",
    });
  }
});

test("unknown task types go to coordinator triage", () => {
  assert.equal(routeTask({ taskType: "unregistered" }).status, "manual_triage");
  assert.equal(routeTask({}).agent, "eliza");
});

test("malformed input requests clarification", () => {
  assert.equal(routeTask(null).status, "needs_clarification");
  assert.equal(routeTask("creative").status, "needs_clarification");
  assert.equal(routeTask([]).status, "needs_clarification");
});

test("read-only GitHub tool requires and accepts its exact scope", () => {
  assert.equal(authorizeTool({
    tool: "github_read",
    grantedScopes: ["github:read"],
  }).allowed, true);
});

test("missing scope denies read-only access", () => {
  assert.equal(authorizeTool({
    tool: "github_read",
    grantedScopes: ["staging:read"],
  }).status, "deny");
});

test("unknown tools are denied", () => {
  assert.equal(authorizeTool({
    tool: "arbitrary_shell",
    grantedScopes: ["*"],
  }).allowed, false);
});

test("all write tools remain disabled in Phase 0", () => {
  assert.equal(authorizeTool({
    tool: "github_branch_write",
    grantedScopes: ["github:branch-write"],
  }).status, "not_implemented");
  assert.equal(authorizeTool({
    tool: "staging_deploy",
    grantedScopes: ["staging:deploy"],
  }).status, "not_implemented");
});

test("protected actions always require the separate human gate", () => {
  for (const tool of [
    "production_deploy",
    "production_routing",
    "billing_change",
    "payment_activation",
    "credential_change",
    "destructive_change",
  ]) {
    assert.equal(authorizeTool({
      tool,
      grantedScopes: ["*"],
      humanApproval: true,
    }).status, "human_gate_required");
  }
});

test("router version is explicit", () => {
  assert.equal(ROUTER_VERSION, "0.1.0");
});
