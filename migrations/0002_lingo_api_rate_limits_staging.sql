-- Add a per-Firebase-UID fixed-window API limiter for authenticated staging routes.
-- One row per Firebase UID; no IP addresses, tokens, or request payloads are stored.
CREATE TABLE IF NOT EXISTS lingo_api_rate_limits (
  firebase_uid TEXT PRIMARY KEY,
  window_epoch INTEGER NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count >= 1),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
