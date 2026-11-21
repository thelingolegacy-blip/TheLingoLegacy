PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS loyalty_wallets (
  user_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','closed')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Append-only credits/debits. Currency and cash-equivalent fields are deliberately absent.
CREATE TABLE IF NOT EXISTS loyalty_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES loyalty_wallets(user_id),
  unit TEXT NOT NULL CHECK (unit IN ('LINGOCOIN','GAME_CREDIT')),
  delta INTEGER NOT NULL CHECK (delta <> 0),
  event_type TEXT NOT NULL CHECK (event_type IN ('AD_REWARD','GAME_GRANT','GAME_SPEND','COUPON_REDEEM','ADMIN_REVERSAL')),
  external_event_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(user_id, idempotency_key),
  UNIQUE(user_id, external_event_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_user_created
  ON loyalty_ledger(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loyalty_ledger_daily_earn
  ON loyalty_ledger(user_id, unit, event_type, created_at);

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  redemption_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES loyalty_wallets(user_id),
  merchant_id TEXT NOT NULL,
  offer_id TEXT NOT NULL,
  authorization_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('issued','redeemed','voided','expired')),
  idempotency_key TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(user_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_user
  ON coupon_redemptions(user_id, created_at DESC);

CREATE VIEW IF NOT EXISTS loyalty_wallet_balances AS
SELECT
  w.user_id,
  w.status,
  COALESCE(SUM(CASE WHEN l.unit = 'LINGOCOIN' THEN l.delta ELSE 0 END), 0) AS lingo_coins,
  COALESCE(SUM(CASE WHEN l.unit = 'GAME_CREDIT' THEN l.delta ELSE 0 END), 0) AS game_credits
FROM loyalty_wallets w
LEFT JOIN loyalty_ledger l ON l.user_id = w.user_id
GROUP BY w.user_id, w.status;

-- Prevent mutation of historical ledger rows. Corrections must be compensating entries.
CREATE TRIGGER IF NOT EXISTS loyalty_ledger_no_update
BEFORE UPDATE ON loyalty_ledger BEGIN
  SELECT RAISE(ABORT, 'ledger rows are append-only');
END;
CREATE TRIGGER IF NOT EXISTS loyalty_ledger_no_delete
BEFORE DELETE ON loyalty_ledger BEGIN
  SELECT RAISE(ABORT, 'ledger rows are append-only');
END;
