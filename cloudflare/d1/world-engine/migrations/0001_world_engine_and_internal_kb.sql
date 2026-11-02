-- LINGOlegacy World Engine + Internal Knowledge Base
-- Target: isolated Cloudflare D1 database "world-engine-db" only.
-- Apply locally first. Do not apply to the production user/session database.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS worlds (
  world_id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  owner_product_id TEXT NOT NULL,
  engine_id TEXT NOT NULL,
  lifecycle_state TEXT NOT NULL DEFAULT 'staged'
    CHECK (lifecycle_state IN ('staged','review','published','paused','archived')),
  access_policy_json TEXT NOT NULL DEFAULT '{}'
    CHECK (json_valid(access_policy_json)),
  asset_namespace TEXT NOT NULL,
  registry_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS world_versions (
  world_id TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0),
  manifest_json TEXT NOT NULL CHECK (json_valid(manifest_json)),
  manifest_sha256 TEXT NOT NULL CHECK (length(manifest_sha256) = 64),
  rights_state TEXT NOT NULL DEFAULT 'pending'
    CHECK (rights_state IN ('pending','cleared','restricted','rejected')),
  created_by TEXT,
  approved_by TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (world_id, version),
  FOREIGN KEY (world_id) REFERENCES worlds(world_id)
);

CREATE TABLE IF NOT EXISTS world_assets (
  asset_id TEXT PRIMARY KEY,
  world_id TEXT NOT NULL,
  world_version INTEGER NOT NULL,
  r2_object_key TEXT NOT NULL UNIQUE,
  mime_type TEXT NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size >= 0),
  sha256 TEXT NOT NULL CHECK (length(sha256) = 64),
  alt_text TEXT,
  rights_state TEXT NOT NULL DEFAULT 'pending'
    CHECK (rights_state IN ('pending','cleared','restricted','rejected')),
  rights_reference TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (world_id, world_version) REFERENCES world_versions(world_id, version)
);

CREATE TABLE IF NOT EXISTS kb_sources (
  source_id TEXT PRIMARY KEY,
  canonical_uri TEXT,
  source_title TEXT NOT NULL,
  source_type TEXT NOT NULL
    CHECK (source_type IN ('repository','website','document','media','manual','api')),
  owner_product_id TEXT NOT NULL,
  trust_tier TEXT NOT NULL DEFAULT 'unreviewed'
    CHECK (trust_tier IN ('unreviewed','first_party','licensed','verified_external','restricted')),
  rights_state TEXT NOT NULL DEFAULT 'pending'
    CHECK (rights_state IN ('pending','cleared','restricted','rejected')),
  sensitivity TEXT NOT NULL DEFAULT 'internal'
    CHECK (sensitivity IN ('public','internal','confidential','restricted')),
  source_sha256 TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kb_documents (
  document_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  title TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'en-US',
  content_type TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'internal'
    CHECK (visibility IN ('public','authenticated','internal','restricted')),
  lifecycle_state TEXT NOT NULL DEFAULT 'draft'
    CHECK (lifecycle_state IN ('draft','review','approved','published','archived')),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
  content_sha256 TEXT NOT NULL CHECK (length(content_sha256) = 64),
  r2_object_key TEXT NOT NULL,
  created_by TEXT,
  approved_by TEXT,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES kb_sources(source_id)
);

CREATE TABLE IF NOT EXISTS kb_chunks (
  chunk_id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
  chunk_text TEXT NOT NULL,
  token_count INTEGER NOT NULL DEFAULT 0 CHECK (token_count >= 0),
  vector_id TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadata_json)),
  UNIQUE (document_id, chunk_index),
  FOREIGN KEY (document_id) REFERENCES kb_documents(document_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kb_ingestion_jobs (
  job_id TEXT PRIMARY KEY,
  source_id TEXT,
  requested_by TEXT,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','running','succeeded','failed','cancelled')),
  discovered_count INTEGER NOT NULL DEFAULT 0,
  accepted_count INTEGER NOT NULL DEFAULT 0,
  rejected_count INTEGER NOT NULL DEFAULT 0,
  error_code TEXT,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_id) REFERENCES kb_sources(source_id)
);

CREATE TABLE IF NOT EXISTS feature_flags (
  flag_key TEXT NOT NULL,
  environment TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 0 CHECK (enabled IN (0,1)),
  rollout_percent INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percent BETWEEN 0 AND 100),
  config_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(config_json)),
  change_reference TEXT,
  updated_by TEXT,
  approved_by TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (flag_key, environment)
);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  scope TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_sha256 TEXT NOT NULL CHECK (length(request_sha256) = 64),
  response_reference TEXT,
  status TEXT NOT NULL CHECK (status IN ('in_progress','completed','failed')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (scope, idempotency_key)
);

CREATE TABLE IF NOT EXISTS world_events (
  event_id TEXT PRIMARY KEY,
  world_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  subject_reference TEXT,
  idempotency_key TEXT,
  payload_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(payload_json)),
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (world_id) REFERENCES worlds(world_id),
  UNIQUE (world_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS audit_events (
  event_id TEXT PRIMARY KEY,
  actor_reference TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  request_id TEXT,
  correlation_id TEXT,
  change_reference TEXT,
  outcome TEXT NOT NULL CHECK (outcome IN ('accepted','rejected','failed','observed')),
  metadata_json TEXT NOT NULL DEFAULT '{}' CHECK (json_valid(metadata_json)),
  occurred_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_worlds_state ON worlds(lifecycle_state, updated_at);
CREATE INDEX IF NOT EXISTS idx_world_assets_world ON world_assets(world_id, world_version);
CREATE INDEX IF NOT EXISTS idx_kb_sources_rights ON kb_sources(rights_state, trust_tier);
CREATE INDEX IF NOT EXISTS idx_kb_documents_visibility ON kb_documents(visibility, lifecycle_state, published_at);
CREATE INDEX IF NOT EXISTS idx_kb_chunks_document ON kb_chunks(document_id, chunk_index);
CREATE INDEX IF NOT EXISTS idx_kb_jobs_status ON kb_ingestion_jobs(status, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_events(resource_type, resource_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_audit_correlation ON audit_events(correlation_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_idempotency_expiry ON idempotency_keys(expires_at);

-- Immutable history: correct by appending a new version/event, never rewriting evidence.
CREATE TRIGGER IF NOT EXISTS trg_world_versions_no_update
BEFORE UPDATE ON world_versions
BEGIN SELECT RAISE(ABORT, 'world_versions are immutable'); END;

CREATE TRIGGER IF NOT EXISTS trg_world_versions_no_delete
BEFORE DELETE ON world_versions
BEGIN SELECT RAISE(ABORT, 'world_versions are immutable'); END;

CREATE TRIGGER IF NOT EXISTS trg_audit_events_no_update
BEFORE UPDATE ON audit_events
BEGIN SELECT RAISE(ABORT, 'audit_events are append-only'); END;

CREATE TRIGGER IF NOT EXISTS trg_audit_events_no_delete
BEFORE DELETE ON audit_events
BEGIN SELECT RAISE(ABORT, 'audit_events are append-only'); END;
