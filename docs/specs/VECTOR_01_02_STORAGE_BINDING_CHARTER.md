# Lingo Legacy Empire — Vector 01/02 Storage Binding Charter

> **Status:** Authoritative Architecture Charter  
> **Scope:** Vector 01/02 production state and settlement infrastructure  
> **Runtime:** Cloudflare Workers + D1 + KV + R2  
> **Security posture:** Fail-closed; no resource IDs or production state are fabricated

## 1. Binding Authority

The Worker storage contracts are explicitly defined as follows:

| Worker binding | Cloudflare service | Authority / purpose |
|---|---|---|
| `DB` | Cloudflare D1 | Authoritative relational ledger and transactional state |
| `STUDIO_KV` | Cloudflare KV | Non-authoritative cache, acceleration, and carefully scoped idempotency support |
| `ASSET_BUCKET` | Cloudflare R2 | Assets and approved evidence/object storage |
| `ASSETS` | Worker Assets | Deployed static application assets |

## 2. Authority Rules

1. **D1 is the authoritative ledger.** Wallet balances, settlement records, economic transactions, and other relational invariants must derive from D1 state.
2. **KV is never the source of financial truth.** A KV value must never independently authorize a wallet credit, debit, settlement, or XP award.
3. **R2 stores objects, not ledger truth.** Object presence or metadata must not independently authorize an economic mutation.
4. **Worker runtime references and Wrangler declarations must match exactly.** The Cloudflare binding verification gate must fail when an active storage reference lacks a declaration.
5. **Real production identifiers are required before deployment.** Placeholder values such as `REPLACE_WITH_ACTUAL_D1_ID` are prohibited from production configuration.
6. **Resource provisioning precedes migration.** A migration cannot be treated as executable against a database whose actual Cloudflare resource identity has not been established.

## 3. Required Reconciliation Sequence

```text
Authoritative Worker references
        ↓
Wrangler binding declarations
        ↓
Real Cloudflare resource identifiers
        ↓
Binding verification gate
        ↓
D1 schema/migration
        ↓
Settlement runtime
        ↓
Staging adversarial tests
        ↓
Evidence + production gate
```

## 4. Current Repository Reality

At the time this charter is created, `wrangler.jsonc` declares `ASSETS` but does not yet contain production `d1_databases`, `kv_namespaces`, or `r2_buckets` declarations. The Worker nevertheless references `env.DB`, `env.STUDIO_KV`, and `env.ASSET_BUCKET` in its capability/status logic.

Therefore this charter **does not authorize invented IDs or premature bindings**. The next implementation gate is to obtain and verify the actual Cloudflare resource identifiers, then update Wrangler configuration accordingly.

## 5. Vector 02 Dependency Gate

The following remain blocked until binding reconciliation is complete:

- `migrations/0001_vector_02_settlement.sql`
- `src/arena/settlement.js`
- staging D1 execution
- concurrency/anti-cheat execution
- ledger-invariance evidence
- production settlement activation

## 6. Non-Negotiable Production Rule

A repository declaration alone does not prove a Cloudflare resource exists, is attached to the intended Worker, or is serving production traffic. Production status requires independent Cloudflare control-plane evidence plus live runtime verification.

This charter is therefore an architectural contract, not a claim that the bindings have already been provisioned or activated.
