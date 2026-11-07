-- Staging-only additive schema. Do not apply to production until G12-G21 pass.
-- Firebase UID is the identity key; do not store email or tokens in this ledger.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS lingo_game_accounts (
  firebase_uid TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS lingo_game_wallets (
  firebase_uid TEXT PRIMARY KEY,
  credits_units INTEGER NOT NULL DEFAULT 0 CHECK (credits_units >= 0),
  xp_units INTEGER NOT NULL DEFAULT 0 CHECK (xp_units >= 0),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (firebase_uid) REFERENCES lingo_game_accounts(firebase_uid) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS lingo_game_sessions (
  session_id TEXT PRIMARY KEY,
  firebase_uid TEXT NOT NULL,
  game_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  rule_version TEXT NOT NULL,
  reels_json TEXT NOT NULL,
  wager_units INTEGER NOT NULL CHECK (wager_units > 0),
  payout_units INTEGER NOT NULL CHECK (payout_units >= 0),
  balance_after_units INTEGER CHECK (balance_after_units >= 0),
  status TEXT NOT NULL CHECK (status IN ('pending','settled')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (firebase_uid, idempotency_key),
  FOREIGN KEY (firebase_uid) REFERENCES lingo_game_accounts(firebase_uid) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS lingo_wallet_ledger (
  event_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  firebase_uid TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('slot_wager_debit','slot_payout_credit','admin_adjustment')),
  delta_units INTEGER NOT NULL CHECK (delta_units != 0),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE (session_id, event_type),
  FOREIGN KEY (session_id) REFERENCES lingo_game_sessions(session_id) ON DELETE RESTRICT,
  FOREIGN KEY (firebase_uid) REFERENCES lingo_game_accounts(firebase_uid) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS lingo_game_progression (
  firebase_uid TEXT PRIMARY KEY,
  xp_units INTEGER NOT NULL DEFAULT 0 CHECK (xp_units >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY (firebase_uid) REFERENCES lingo_game_accounts(firebase_uid) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_lingo_game_sessions_uid_created
  ON lingo_game_sessions(firebase_uid, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lingo_wallet_ledger_uid_created
  ON lingo_wallet_ledger(firebase_uid, created_at DESC);

CREATE TRIGGER IF NOT EXISTS lingo_wallet_ledger_validate_insert
BEFORE INSERT ON lingo_wallet_ledger
BEGIN
  SELECT CASE
    WHEN NOT EXISTS (SELECT 1 FROM lingo_game_wallets WHERE firebase_uid = NEW.firebase_uid)
    THEN RAISE(ABORT, 'WALLET_NOT_FOUND')
  END;
  SELECT CASE
    WHEN (SELECT credits_units + NEW.delta_units FROM lingo_game_wallets WHERE firebase_uid = NEW.firebase_uid) < 0
    THEN RAISE(ABORT, 'INSUFFICIENT_FUNDS')
  END;
END;

CREATE TRIGGER IF NOT EXISTS lingo_wallet_ledger_apply_insert
AFTER INSERT ON lingo_wallet_ledger
BEGIN
  UPDATE lingo_game_wallets
     SET credits_units = credits_units + NEW.delta_units,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
   WHERE firebase_uid = NEW.firebase_uid;
END;

-- The ledger is append-only. Corrections must be compensating entries.
CREATE TRIGGER IF NOT EXISTS lingo_wallet_ledger_no_update
BEFORE UPDATE ON lingo_wallet_ledger
BEGIN
  SELECT RAISE(ABORT, 'LEDGER_IS_APPEND_ONLY');
END;
CREATE TRIGGER IF NOT EXISTS lingo_wallet_ledger_no_delete
BEFORE DELETE ON lingo_wallet_ledger
BEGIN
  SELECT RAISE(ABORT, 'LEDGER_IS_APPEND_ONLY');
END;
