# Lingo Legacy Empire — Vector 02 Settlement & Anti-Cheat Specification

> **Status:** Authoritative / Hardened  
> **Target Runtime:** Cloudflare Edge Workers + D1 Relational Ledger  
> **Security Mandate:** Zero Client-Side Trust (Server-Authoritative Rules)  

---

## 1. Core Security Guarantees

Every invocation of `POST /api/v1/arena/match/settle` must enforce the following non-negotiable guarantees:

1. **Identity Integrity:** The caller's authenticated Firebase UID must resolve to a `lingo_id` that precisely matches `matches.lingo_id`. Cross-user settlement attempts are blocked with HTTP `403`.
2. **State Atomicity:** A match must be in an `ACTIVE` state. Matches that are already `SETTLED` or `ABORTED` reject secondary settlement attempts with HTTP `409`.
3. **Score Boundaries:** Final scores are strictly validated against `GAME_CONFIGS[module].max_score`. Negative scores or values exceeding maximum bounds trigger an immediate HTTP `400` rejection.
4. **Server-Side Reward Calculation:** Clients are strictly forbidden from passing multipliers, reward values, or XP gains. Rewards are computed via deterministic, server-only math functions.
5. **Race Condition Protection:** SQLite batch transactions utilize conditional updates (`WHERE status = 'ACTIVE'`) to guarantee that concurrent settlement requests against the exact same match ID result in exactly one success and subsequent failures.

---

## 2. Authoritative D1 Schema Additions

```sql
-- Settlement Table
CREATE TABLE IF NOT EXISTS match_settlements (
    settlement_id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    lingo_id TEXT NOT NULL,
    game_module TEXT NOT NULL,
    final_score INTEGER NOT NULL,
    reward_credits INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (match_id) REFERENCES matches(match_id),
    FOREIGN KEY (lingo_id) REFERENCES users(lingo_id)
);

CREATE INDEX IF NOT EXISTS idx_match_settlements_match ON match_settlements(match_id);

-- Match Evidence & Audit Trail (Optional telemetry/anti-cheat hashing)
CREATE TABLE IF NOT EXISTS match_evidence (
    evidence_id TEXT PRIMARY KEY,
    match_id TEXT NOT NULL,
    lingo_id TEXT NOT NULL,
    payload_hash TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (match_id) REFERENCES matches(match_id)
);
```

## 3. Server-Only Reward & XP Logic

```ts
export const GAME_CONFIGS = {
  'thats_my_lingo': { entry_fee: 25, max_score: 2000 },
  'spades_is_my_lingo': { entry_fee: 50, max_score: 5000 },
  'uno_lingo': { entry_fee: 20, max_score: 1500 },
  'cashman_lingo_mania': { entry_fee: 100, max_score: 10000 }
};

export function calculateReward(config, final_score) {
  const base = config.entry_fee;
  const ratio = Math.max(0, Math.min(1, final_score / config.max_score));
  const multiplier = Math.min(3, 0.5 + ratio * 2.5); // Capped at 3x return
  return Math.floor(base * multiplier);
}

export function computeXpGain(config, final_score) {
  const ratio = Math.max(0, Math.min(1, final_score / config.max_score));
  return Math.floor(50 + ratio * 150); // Generates 50 to 200 XP range
}
```

## 4. Anti-Cheat Test Validation Matrix

| Test Scenario | Input Vector | Expected System Response |
|---|---|---|
| Identity Mismatch | User A attempts to settle User B's `match_id` | HTTP 403 Forbidden (Match does not belong to this user) |
| Double Settlement | Two concurrent requests to `/settle` for the same `match_id` | Exactly one request returns 200 OK, second returns 409 Conflict |
| Score Tampering | `final_score: 999999` (Exceeds config limit) | HTTP 400 Bad Request (Score out of allowed bounds) |
| Negative Score | `final_score: -500` | HTTP 400 Bad Request (Score out of allowed bounds) |
| Module Spoofing | Client injects unauthorized `game_module` | HTTP 400 / 500 (Rejected by allowlist configuration) |
| Ledger Integrity | Post-settlement database audit | Sum of entry fees, settlements, and wallet balances balance across transactions and users tables |

---

## 5. Settlement Contract

The settlement endpoint is server-authoritative. The client may submit only the match identifier and permitted match-finalization evidence required by the game protocol. The server resolves the authenticated identity, match ownership, module configuration, score boundaries, reward, and XP outcome from trusted state.

The implementation must preserve idempotency and atomicity under concurrent requests. A successful settlement must atomically transition the match from `ACTIVE` to `SETTLED`, create exactly one settlement record, and apply the corresponding ledger mutations. A failed conditional state transition must not produce a second reward or XP grant.

No client-supplied `reward_credits`, multiplier, XP amount, entry fee, or authoritative `game_module` may be trusted for ledger mutation.

### Ledger invariants

For every successfully settled match:

- There is exactly one authoritative settlement record.
- The settlement belongs to the authenticated `lingo_id` associated with the match.
- `reward_credits` is derived exclusively from server-side configuration and validated final score.
- The match status is `SETTLED` after commit.
- Duplicate requests cannot create duplicate economic or XP effects.
- All related ledger mutations commit or roll back as one transaction.

> **Important:** This specification assumes the referenced `matches` and `users` tables exist and that the D1 transaction implementation enforces the stated conditional-update and uniqueness invariants. The specification itself does not claim that the runtime implementation has already been deployed or empirically verified.

---

## Current Gate Status

- **Vector 01 / 02 Hardening:** 🟢 **Architecture and settlement/anti-cheat contract locked.**
- **Vector 03 AskLINGO:** ⏸️ **On disciplined hold until the settlement/state engine is implemented and empirically verified.**

This document is the authoritative engineering contract for the arena settlement layer covering **That's My Lingo, Spades Is My Lingo, UNO-LINGO, and Cashman LINGO Mania**. Production activation remains governed by the repository's fail-closed deployment and live-verification gates.
