-- LINGO Finance Command core schema candidate.
-- REVIEW ONLY: do not apply to any D1/database until schema review, backup/restore,
-- migration plan, staging approval, and independent validation are complete.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS finance_legal_entities (
  entity_id TEXT PRIMARY KEY,
  legal_name TEXT NOT NULL,
  jurisdiction_code TEXT,
  registration_reference TEXT,
  status TEXT NOT NULL DEFAULT 'unverified'
    CHECK (status IN ('unverified','verified','inactive')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS finance_cost_centers (
  cost_center_id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  parent_cost_center_id TEXT REFERENCES finance_cost_centers(cost_center_id),
  entity_id TEXT REFERENCES finance_legal_entities(entity_id),
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed','active','inactive')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS finance_products (
  product_id TEXT PRIMARY KEY,
  product_code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  brand_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed','active','inactive')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS finance_accounts (
  account_id TEXT PRIMARY KEY,
  account_code TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL
    CHECK (account_type IN ('asset','liability','equity','revenue','expense')),
  normal_balance TEXT NOT NULL CHECK (normal_balance IN ('debit','credit')),
  currency_code TEXT NOT NULL CHECK (currency_code GLOB '[A-Z][A-Z][A-Z]'),
  is_control_account INTEGER NOT NULL DEFAULT 0 CHECK (is_control_account IN (0,1)),
  status TEXT NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed','active','inactive'))
);

CREATE TABLE IF NOT EXISTS finance_events (
  event_id TEXT PRIMARY KEY,
  idempotency_key TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  environment TEXT NOT NULL CHECK (environment IN ('sandbox','staging','production')),
  event_type TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  entity_id TEXT REFERENCES finance_legal_entities(entity_id),
  product_id TEXT REFERENCES finance_products(product_id),
  cost_center_id TEXT REFERENCES finance_cost_centers(cost_center_id),
  provider TEXT,
  provider_object_ref TEXT,
  currency_code TEXT NOT NULL CHECK (currency_code GLOB '[A-Z][A-Z][A-Z]'),
  amount_minor INTEGER NOT NULL CHECK (amount_minor >= 0),
  payload_sha256 TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received','processing','posted','rejected','quarantined'))
);

CREATE TABLE IF NOT EXISTS finance_journal_entries (
  journal_entry_id TEXT PRIMARY KEY,
  source_event_id TEXT UNIQUE REFERENCES finance_events(event_id),
  entity_id TEXT NOT NULL REFERENCES finance_legal_entities(entity_id),
  currency_code TEXT NOT NULL CHECK (currency_code GLOB '[A-Z][A-Z][A-Z]'),
  entry_date TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','posted','reversed')),
  reversal_of TEXT REFERENCES finance_journal_entries(journal_entry_id),
  created_by TEXT NOT NULL,
  approved_by TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  posted_at TEXT,
  CHECK (approved_by IS NULL OR approved_by <> created_by)
);

CREATE TABLE IF NOT EXISTS finance_journal_lines (
  journal_line_id TEXT PRIMARY KEY,
  journal_entry_id TEXT NOT NULL REFERENCES finance_journal_entries(journal_entry_id),
  line_number INTEGER NOT NULL CHECK (line_number > 0),
  account_id TEXT NOT NULL REFERENCES finance_accounts(account_id),
  cost_center_id TEXT REFERENCES finance_cost_centers(cost_center_id),
  product_id TEXT REFERENCES finance_products(product_id),
  side TEXT NOT NULL CHECK (side IN ('debit','credit')),
  amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
  memo TEXT,
  UNIQUE (journal_entry_id, line_number)
);

CREATE TABLE IF NOT EXISTS finance_approvals (
  approval_id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL,
  resource_ref TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  approved_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected','expired','consumed')),
  reason TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  CHECK (approved_by IS NULL OR approved_by <> requested_by)
);

CREATE TABLE IF NOT EXISTS finance_audit_events (
  audit_id TEXT PRIMARY KEY,
  actor_ref TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_ref TEXT NOT NULL,
  correlation_id TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('allowed','denied','error')),
  occurred_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  details_json TEXT
);

CREATE INDEX IF NOT EXISTS idx_finance_events_status
  ON finance_events(environment, processing_status, received_at);
CREATE INDEX IF NOT EXISTS idx_finance_journal_entity_date
  ON finance_journal_entries(entity_id, entry_date, status);
CREATE INDEX IF NOT EXISTS idx_finance_lines_account
  ON finance_journal_lines(account_id, journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_finance_approvals_status_expiry
  ON finance_approvals(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_finance_audit_resource
  ON finance_audit_events(resource_type, resource_ref, occurred_at);

-- A journal cannot be posted unless it has at least two lines and balances exactly.
CREATE TRIGGER IF NOT EXISTS finance_journal_validate_post
BEFORE UPDATE OF status ON finance_journal_entries
WHEN NEW.status = 'posted' AND OLD.status <> 'posted'
BEGIN
  SELECT CASE
    WHEN (SELECT COUNT(*) FROM finance_journal_lines
          WHERE journal_entry_id = NEW.journal_entry_id) < 2
    THEN RAISE(ABORT, 'journal requires at least two lines')
  END;
  SELECT CASE
    WHEN (SELECT COALESCE(SUM(CASE WHEN side='debit' THEN amount_minor ELSE 0 END),0)
          FROM finance_journal_lines WHERE journal_entry_id = NEW.journal_entry_id)
       <> (SELECT COALESCE(SUM(CASE WHEN side='credit' THEN amount_minor ELSE 0 END),0)
          FROM finance_journal_lines WHERE journal_entry_id = NEW.journal_entry_id)
    THEN RAISE(ABORT, 'journal debits and credits must balance')
  END;
  SELECT CASE
    WHEN NEW.approved_by IS NULL OR NEW.approved_by = NEW.created_by
    THEN RAISE(ABORT, 'independent approval required before posting')
  END;
END;

-- Posted journal headers and lines are immutable; correct with reversal entries.
CREATE TRIGGER IF NOT EXISTS finance_posted_header_no_update
BEFORE UPDATE ON finance_journal_entries
WHEN OLD.status IN ('posted','reversed')
BEGIN
  SELECT RAISE(ABORT, 'posted journal header is immutable');
END;
CREATE TRIGGER IF NOT EXISTS finance_posted_header_no_delete
BEFORE DELETE ON finance_journal_entries
WHEN OLD.status IN ('posted','reversed')
BEGIN
  SELECT RAISE(ABORT, 'posted journal header cannot be deleted');
END;
CREATE TRIGGER IF NOT EXISTS finance_posted_line_no_insert
BEFORE INSERT ON finance_journal_lines
WHEN (SELECT status FROM finance_journal_entries
      WHERE journal_entry_id=NEW.journal_entry_id) IN ('posted','reversed')
BEGIN
  SELECT RAISE(ABORT, 'cannot add lines to a posted journal');
END;
CREATE TRIGGER IF NOT EXISTS finance_posted_line_no_update
BEFORE UPDATE ON finance_journal_lines
WHEN (SELECT status FROM finance_journal_entries
      WHERE journal_entry_id=OLD.journal_entry_id) IN ('posted','reversed')
BEGIN
  SELECT RAISE(ABORT, 'posted journal lines are immutable');
END;
CREATE TRIGGER IF NOT EXISTS finance_posted_line_no_delete
BEFORE DELETE ON finance_journal_lines
WHEN (SELECT status FROM finance_journal_entries
      WHERE journal_entry_id=OLD.journal_entry_id) IN ('posted','reversed')
BEGIN
  SELECT RAISE(ABORT, 'posted journal lines cannot be deleted');
END;
