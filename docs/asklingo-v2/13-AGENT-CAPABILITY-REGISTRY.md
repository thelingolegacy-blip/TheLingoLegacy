# Agent capability registry — implementation boundary

## Delivered
- Pure registration validation for active agent identity, bound service identity, tenant, expiry, and non-empty scoped capability records.
- Duplicate capability rejection and exact tenant matching.
- Server-side authorization helper requiring an active service identity bound to the registered agent.
- Exact tenant/product/resource type/resource ID/operation/environment matching; no wildcard, inherited, or ambient capability.
- Node test suite runnable independently with `node --test scripts/tests/agent-capability-registry.test.mjs`.

## Limitations
This module does not persist or enroll agents, issue credentials, validate signed workload identity, load authoritative registry records, implement delegation, execute tools, or write audit records. It accepts records only as trusted inputs from a future server-side registry adapter. Do not pass client-supplied agent or service records.

Not wired to the public askLINGO facade or any production service. No secrets, providers, databases, Cloudflare bindings, Firebase resources, routes, or DNS changed.

## Validation
Run `npm run test:asklingo:agents` and `npm test` with Node.js >=20. A workflow run, instantiated job, logs, and artifacts are still required for CI evidence.

## Remaining gates
Implement authoritative registry storage, identity attestation, revocation, delegated-scope subset proofs, durable audit, and independent security review before staging integration.