import test from "node:test";
import assert from "node:assert/strict";
import { authorizeServerRequest } from "./authorization.mjs";

const principal = {
  id: "user-1", type: "human", status: "active",
  tenantIds: ["tenant-a"], roles: ["operator"], attributes: {}
};
const trusted = {
  authenticatedUid: "user-1",
  principal,
  action: "wallet.read",
  resource: { id: "wallet-1", type: "wallet", tenantId: "tenant-a", productDomain: "LINGOlegacy", attributes: {} },
  context: { tenantId: "tenant-a", productDomain: "LINGOlegacy", environment: "staging", attributes: {} }
};
const policy = {
  version: "policy-v1", status: "active",
  rules: [{
    id: "wallet-read", effect: "allow", principalTypes: ["human"], roles: ["operator"],
    actions: ["wallet.read"], resourceTypes: ["wallet"], tenantIds: ["tenant-a"],
    productDomains: ["LINGOlegacy"], environments: ["staging"]
  }]
};
function dependencies(overrides = {}) {
  return {
    request: { headers: { authorization: "Bearer untrusted-client-token" } },
    authenticate: async () => ({ ok: true, uid: "user-1" }),
    resolveTrustedContext: async () => trusted,
    loadPolicy: async () => policy,
    auditDecision: async () => ({ committed: true }),
    ...overrides
  };
}

test("trusted server identity and policy produce an audited allow", async () => {
  const result = await authorizeServerRequest(dependencies());
  assert.equal(result.decision, "ALLOW");
});
test("client-provided role does not replace trusted server context", async () => {
  const result = await authorizeServerRequest(dependencies({
    request: { role: "admin", uid: "attacker" },
    resolveTrustedContext: async () => ({ ...trusted, principal: { ...principal, roles: ["viewer"] } })
  }));
  assert.equal(result.decision, "DENY");
});
test("authentication failure is denied and audited", async () => {
  let audited = false;
  const result = await authorizeServerRequest(dependencies({
    authenticate: async () => ({ ok: false }),
    auditDecision: async () => { audited = true; return { committed: true }; }
  }));
  assert.equal(result.reason, "AUTHENTICATION_REQUIRED");
  assert.equal(audited, true);
});
test("authentication provider failure is indeterminate", async () => {
  const result = await authorizeServerRequest(dependencies({ authenticate: async () => { throw new Error("offline"); } }));
  assert.equal(result.reason, "AUTHENTICATION_UNAVAILABLE");
});
test("missing policy fails closed", async () => {
  const result = await authorizeServerRequest(dependencies({ loadPolicy: async () => null }));
  assert.equal(result.decision, "INDETERMINATE");
});
test("audit failure prevents an allow decision", async () => {
  const result = await authorizeServerRequest(dependencies({ auditDecision: async () => ({ committed: false }) }));
  assert.equal(result.reason, "AUTHORIZATION_AUDIT_UNAVAILABLE");
});
test("missing audit adapter prevents authorization", async () => {
  const args = dependencies();
  delete args.auditDecision;
  const result = await authorizeServerRequest(args);
  assert.equal(result.reason, "AUTHORIZATION_AUDIT_UNAVAILABLE");
});
test("cross-tenant resource context is denied and audited", async () => {
  const result = await authorizeServerRequest(dependencies({
    resolveTrustedContext: async () => ({
      ...trusted,
      context: { ...trusted.context, tenantId: "tenant-b" }
    })
  }));
  assert.equal(result.decision, "DENY");
});

test("authorization audit receives correlation ID but never raw request credentials", async () => {
  let auditRecord;
  const result = await authorizeServerRequest(dependencies({
    requestId: "server-request-01",
    auditDecision: async record => { auditRecord = record; return { committed: true }; }
  }));
  assert.equal(result.decision, "ALLOW");
  assert.equal(auditRecord.requestId, "server-request-01");
  assert.equal(Object.hasOwn(auditRecord, "request"), false);
  assert.equal(JSON.stringify(auditRecord).includes("Bearer"), false);
});

test("trusted principal context must bind to authenticated identity", async () => {
  const result = await authorizeServerRequest(dependencies({
    resolveTrustedContext: async () => ({ ...trusted, authenticatedUid: "attacker-uid" })
  }));
  assert.equal(result.reason, "TRUSTED_CONTEXT_INVALID_OR_IDENTITY_MISMATCH");
});
