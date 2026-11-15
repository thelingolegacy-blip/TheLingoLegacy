# DMC implementation and integration status

**Branch:** `feature/lingoai-agent-network-foundation`  
**Control baseline:** protected production hold  
**Status vocabulary:** source-built is not tested, deployed, connected, accepted or certified.

## Built in this branch
- JSON Schema contracts for approval requests, policy decisions, audit events and handoffs.
- Node.js policy engine with stable payload hashing, tenant/project/action scope checks, explicit risk tiers, policy-version binding, human-only approval, requester/approver separation, expiry, replay and protected-production checks.
- Handoff state machine with receiver-only acceptance/progress, human-owner completion/rejection/cancellation, scope/tool invariance, prohibited-action preservation, idempotency, expiry, retry cap and delegation-cycle guard.
- Audit-event contract with append-only event shape and sensitive-field key rejection.
- Negative authorization tests using Node's built-in test runner.
- Firebase Functions v2 adapter source for request, human decision, action authorization, handoff create/transition and control-status calls.
- Firestore client access deny rules for the three DMC collections, supplied as a fragment; they are not merged into the production Firestore ruleset.
- Fail-closed agent-runtime gateway adapter contract.
- Dedicated Firebase CLI config for emulator/sandbox work. It does not change the repository's production Firebase configuration.

## Integration boundaries
- Firebase Authentication is the identity authority; the adapter trusts only server-issued custom claims. This branch does not provision claims or roles.
- Firestore is the durable record adapter. Approval, audit and handoff writes occur inside server-side Firestore transactions. Audit records are created, never updated by these functions.
- The adapter source is **not deployed**. The root Firebase config still targets the existing hosting surface; '.firebaserc' identifies the production project. No production Firebase command was run.
- The existing 15-agent registry still states `runtime_connected: false`. The gateway adapter is ready for integration but no live model/tool runtime is present to call it.
- No DMC user interface is represented as an operating control plane. The callable server controls, identity claims, transaction boundary and runtime gateway must be deployed and verified before the UI can be treated as operational.
- Firestore rules fragment is not activated because the repository does not yet expose a complete canonical ruleset; deploying a fragment as a full ruleset could unintentionally deny existing application access.

## Verification still required
1. Execute `npm test` in Node 20 and obtain the hosted GitHub Actions job, logs and artifact.
2. Add Firebase Emulator Suite integration tests for authenticated/unauthenticated callers, custom-claim spoofing, approval concurrency/replay, Firestore transaction rollback, audit sink failure, handoff authorization and tenant isolation.
3. Reconcile DMC Firestore rules into the authoritative existing ruleset and verify existing clients are not broken.
4. Deploy only to an explicitly identified non-production Firebase project; verify deployed callable endpoints and persisted records.
5. Connect the actual agent runtime/tool gateway to `authorizeDmcAgentAction`; prove no tool invocation occurs after a deny, timeout or missing audit record.
6. Independent security and QA review, recovery test, owner acceptance, and separately authorized release decision.

## Explicit restrictions
- `PRODUCTION_HOLD = true` is hard-coded in the Firebase adapter.
- Production environment requests are denied. Protected operations remain denied under the current hold.
- No G02 runner activation, production deploy, DNS/Worker change, Firebase publication, secrets change, payments, wallet transfer, destructive migration, paid provisioning or permissions broadening is authorized.
- Ecosystem certification remains **NOT CERTIFIED**.
