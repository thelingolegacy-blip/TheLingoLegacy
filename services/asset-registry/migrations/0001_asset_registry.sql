PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS assets (
  asset_id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 160),
  category TEXT NOT NULL CHECK(length(category) BETWEEN 2 AND 64),
  description TEXT NOT NULL DEFAULT '' CHECK(length(description) <= 2000),
  owner_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','IN_REVIEW','PUBLISHED','ARCHIVED')),
  current_version_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_assets_updated ON assets(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_owner ON assets(owner_email);

CREATE TABLE IF NOT EXISTS asset_versions (
  version_id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES assets(asset_id),
  version_number INTEGER NOT NULL CHECK(version_number > 0),
  source_uri TEXT NOT NULL,
  sha256 TEXT NOT NULL CHECK(length(sha256) = 64),
  media_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK(byte_size >= 0 AND byte_size <= 1073741824),
  change_note TEXT NOT NULL DEFAULT '' CHECK(length(change_note) <= 1000),
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(asset_id, version_number)
);
CREATE INDEX IF NOT EXISTS idx_versions_asset ON asset_versions(asset_id, version_number DESC);

CREATE TABLE IF NOT EXISTS rights_evidence (
  evidence_id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES assets(asset_id),
  version_id TEXT NOT NULL REFERENCES asset_versions(version_id),
  rights_type TEXT NOT NULL CHECK(rights_type IN ('owned','licensed','public-domain','permission-pending')),
  license_name TEXT NOT NULL DEFAULT '',
  evidence_uri TEXT NOT NULL,
  evidence_sha256 TEXT,
  submitted_by TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rights_asset_version ON rights_evidence(asset_id, version_id);

CREATE TABLE IF NOT EXISTS review_decisions (
  decision_id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES assets(asset_id),
  version_id TEXT NOT NULL REFERENCES asset_versions(version_id),
  review_type TEXT NOT NULL CHECK(review_type IN ('integrity','rights','quality','brand')),
  decision TEXT NOT NULL CHECK(decision IN ('APPROVED','REJECTED')),
  reviewer_email TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '' CHECK(length(notes) <= 1000),
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reviews_current ON review_decisions(asset_id, version_id, review_type, created_at DESC);

CREATE TABLE IF NOT EXISTS asset_publications (
  publication_id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES assets(asset_id),
  version_id TEXT NOT NULL REFERENCES asset_versions(version_id),
  action TEXT NOT NULL CHECK(action IN ('PUBLISH','ROLLBACK')),
  actor_email TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_publications_asset ON asset_publications(asset_id, created_at DESC);

CREATE TABLE IF NOT EXISTS audit_events (
  event_id TEXT PRIMARY KEY,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  asset_id TEXT,
  version_id TEXT,
  details_json TEXT NOT NULL DEFAULT '{}',
  request_id TEXT NOT NULL,
  occurred_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_asset ON audit_events(asset_id, occurred_at DESC);

-- Version records, rights evidence, review decisions, publication events and audit
-- events are append-only. Corrections are represented by new records, never edits.
CREATE TRIGGER IF NOT EXISTS immutable_asset_versions_update
BEFORE UPDATE ON asset_versions BEGIN SELECT RAISE(ABORT, 'asset versions are immutable'); END;
CREATE TRIGGER IF NOT EXISTS immutable_asset_versions_delete
BEFORE DELETE ON asset_versions BEGIN SELECT RAISE(ABORT, 'asset versions are immutable'); END;
CREATE TRIGGER IF NOT EXISTS immutable_rights_evidence_update
BEFORE UPDATE ON rights_evidence BEGIN SELECT RAISE(ABORT, 'rights evidence is immutable'); END;
CREATE TRIGGER IF NOT EXISTS immutable_rights_evidence_delete
BEFORE DELETE ON rights_evidence BEGIN SELECT RAISE(ABORT, 'rights evidence is immutable'); END;
CREATE TRIGGER IF NOT EXISTS immutable_review_decisions_update
BEFORE UPDATE ON review_decisions BEGIN SELECT RAISE(ABORT, 'review decisions are immutable'); END;
CREATE TRIGGER IF NOT EXISTS immutable_review_decisions_delete
BEFORE DELETE ON review_decisions BEGIN SELECT RAISE(ABORT, 'review decisions are immutable'); END;
CREATE TRIGGER IF NOT EXISTS immutable_publications_update
BEFORE UPDATE ON asset_publications BEGIN SELECT RAISE(ABORT, 'publication history is immutable'); END;
CREATE TRIGGER IF NOT EXISTS immutable_publications_delete
BEFORE DELETE ON asset_publications BEGIN SELECT RAISE(ABORT, 'publication history is immutable'); END;
CREATE TRIGGER IF NOT EXISTS immutable_audit_events_update
BEFORE UPDATE ON audit_events BEGIN SELECT RAISE(ABORT, 'audit events are immutable'); END;
CREATE TRIGGER IF NOT EXISTS immutable_audit_events_delete
BEFORE DELETE ON audit_events BEGIN SELECT RAISE(ABORT, 'audit events are immutable'); END;
