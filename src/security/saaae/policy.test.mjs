import test from "node:test";
import assert from "node:assert/strict";
import { evaluateAuthorization } from "./policy.mjs";

const principal = {
  id: "user-1",
  type: "human",
  status: "active",
  tenantIds: ["tenant-a"],
  roles: ["operator"],
  attributes: { region: "US-PA", clearance: "standard" }
};
const resource = {
  id: "wallet-1",
  type: "wallet",
  tenantId: "tenant-a",
  productDomain: "LINGOlegacy",
  attributes: { ownerId: "user-1", sensitivity: "financial" }
};
const context = {
  tenantId: "tenant-a",
  productDomain: "LINGOlegacy",
  environment: "staging",
  attributes: { channel: "api" }
};
const allowPolicy = {
  version: "saaae-test-v1",
  status: "active",
  rules: [{
    id: "wallet-operator-read",
    effect: "allow",
    principalTypes: ["human"],
    roles: ["operator"],
    actions: ["wallet.read"],
    resourceTypes: ["wallet"],
    tenantIds: ["tenant-a"],
    productDomains: ["LINGOlegacy"],
    environments: ["staging"]
  }]
};

test("allows a fully scoped request matching an active allow rule", () => {
  const result = evaluateAuthorization({ principal, action: "wallet.read", resource, context, policy: allowPolicy });
  assert.equal(result.decision, "ALLOW");
  assert.equal(result.policyVersion, "saaae-test-v1");
  assert.deepEqual(result.matchedRuleIds, ["wallet-operator-read"]);
});

test("defaults to deny when no allow rule matches", () => {
  const result = evaluateAuthorization({ principal, action: "wallet.write", resource, context, policy: allowPolicy });
  assert.equal(result.decision, "DENY");
  assert.equal(result.reason, "NO_MATCHING_ALLOW_RULE");
});

test("explicit deny overrides a matching allow rule", () => {
  const policy = {
    ...allowPolicy,
    rules: [...allowPolicy.rules, {
      id: "deny-financial-write",
      effect: "deny",
      actions: ["wallet.read"],
      resourceTypes: ["wallet"],
      tenantIds: ["tenant-a"],
      productDomains: ["LINGOlegacy"],
      environments: ["staging"],
      principalTypes: ["human"]
    }]
  };
  const result = evaluateAuthorization({ principal, action: "wallet.read", resource, context, policy });
  assert.equal(result.decision, "DENY");
  assert.deepEqual(result.matchedRuleIds, ["deny-financial-write"]);
});

test("cross-tenant and cross-domain context is denied", () => {
  const result = evaluateAuthorization({
    principal,
    action: "wallet.read",
    resource,
    context: { ...context, tenantId: "tenant-b" },
    policy: allowPolicy
  });
  assert.equal(result.decision, "DENY");
  assert.equal(result.reason, "TENANT_OR_DOMAIN_BOUNDARY_MISMATCH");
});

test("inactive principal is indeterminate and cannot be allowed", () => {
  const result = evaluateAuthorization({
    principal: { ...principal, status: "revoked" },
    action: "wallet.read", resource, context, policy: allowPolicy
  });
  assert.equal(result.decision, "INDETERMINATE");
  assert.equal(result.reason, "PRINCIPAL_UNVERIFIED_OR_INVALID");
});

test("missing or malformed policy fails closed", () => {
  const result = evaluateAuthorization({ principal, action: "wallet.read", resource, context, policy: null });
  assert.equal(result.decision, "INDETERMINATE");
  assert.equal(result.reason, "POLICY_UNAVAILABLE_OR_INVALID");
});

test("ABAC attribute conditions require exact server-resolved values", () => {
  const policy = {
    ...allowPolicy,
    rules: [{
      ...allowPolicy.rules[0],
      conditions: {
        principalAttributes: { region: "US-PA" },
        resourceAttributes: { ownerId: "user-1" },
        contextAttributes: { channel: "api" }
      }
    }]
  };
  assert.equal(evaluateAuthorization({ principal, action: "wallet.read", resource, context, policy }).decision, "ALLOW");
  assert.equal(evaluateAuthorization({
    principal: { ...principal, attributes: { region: "US-NJ" } },
    action: "wallet.read", resource, context, policy
  }).decision, "DENY");
});

test("expired rules are not effective", () => {
  const policy = {
    ...allowPolicy,
    rules: [{ ...allowPolicy.rules[0], expiresAt: "2026-11-20T00:00:00.000Z" }]
  };
  const result = evaluateAuthorization({
    principal, action: "wallet.read", resource, context, policy, now: "2026-11-21T00:00:00.000Z"
  });
  assert.equal(result.decision, "DENY");
});

test("allow rules without a principal selector invalidate the policy", () => {
  const policy = {
    ...allowPolicy,
    rules: [{
      id: "unsafe-allow",
      effect: "allow",
      actions: ["wallet.read"],
      resourceTypes: ["wallet"],
      tenantIds: ["tenant-a"],
      productDomains: ["LINGOlegacy"],
      environments: ["staging"]
    }]
  };
  const result = evaluateAuthorization({ principal, action: "wallet.read", resource, context, policy });
  assert.equal(result.decision, "INDETERMINATE");
  assert.equal(result.reason, "POLICY_UNAVAILABLE_OR_INVALID");
});

test("duplicate policy rule identifiers invalidate the policy", () => {
  const rule = allowPolicy.rules[0];
  const policy = { ...allowPolicy, rules: [rule, { ...rule }] };
  const result = evaluateAuthorization({ principal, action: "wallet.read", resource, context, policy });
  assert.equal(result.decision, "INDETERMINATE");
  assert.equal(result.reason, "POLICY_UNAVAILABLE_OR_INVALID");
});

test("malformed conditions fail closed rather than matching", () => {
  const policy = {
    ...allowPolicy,
    rules: [{ ...allowPolicy.rules[0], conditions: { unknownAttributes: { x: "y" } } }]
  };
  const result = evaluateAuthorization({ principal, action: "wallet.read", resource, context, policy });
  assert.equal(result.decision, "INDETERMINATE");
  assert.equal(result.reason, "POLICY_UNAVAILABLE_OR_INVALID");
});
