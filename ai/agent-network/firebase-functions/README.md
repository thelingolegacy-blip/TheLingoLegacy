# DMC Firebase control-plane adapter

This is a server-side Firebase Functions v2 adapter for the authoritative Firebase Authentication / Firestore boundary. It is source code only until separately reviewed and deployed. The repository's current .firebaserc points at lingo-legacy-production; **do not deploy this package from this branch**.

## Trusted identity contract
Firebase Authentication must issue server-controlled custom claims: tenantId, accountStatus=active, agentId for agents, dmcRole for humans, dmcScopes for project/action/approval scope, and dmcTools for allowed tool identifiers. Clients cannot set or override these claims. A separate privileged identity-administration workflow must issue/revoke them; this package does not grant roles.

## Callable functions
- requestDmcApproval: authenticated, scoped agent submits an immutable action digest.
- decideDmcApproval: authenticated human reviewer decides; requester cannot self-approve; reviewer scope and R3/R4 role checks apply.
- authorizeDmcAgentAction: checks exact payload, resource, project, realm, environment, role, approval, expiry, replay and audit; production is hard-held. Approval consumption is transactionally single-use.
- createDmcHandoff / transitionDmcHandoff: enforce sender scope, known receiver IDs, human owner accountability, receiver acceptance, state transitions, expiry and idempotency.
- getDmcControlStatus: reports source-only / not deployed status.

## Non-negotiable deployment gates
1. Use firebase.dmc.json and an explicitly selected non-production project or Firebase Emulator Suite; never rely on the default production alias.
2. Deploy to an isolated non-production Firebase project first, never the current production alias.
3. Reconcile firestore.rules into the authoritative full ruleset only after inspecting existing client access requirements; the included file is a DMC deny-direct-access fragment, not a replacement ruleset.
4. Provision service identity and custom claims through a separately reviewed least-privilege workflow.
5. Verify callable auth, emulator tests, audit append-only behavior, concurrency, replay and fail-closed behavior.
6. Connect the actual agent tool gateway to authorizeDmcAgentAction; the existing agent registry/runtime is still marked not connected.
7. Production deployment requires independent security/QA acceptance and separate release authorization. The hard-coded production hold remains true until that authorization is recorded.
