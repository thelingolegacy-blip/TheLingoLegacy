BEGIN;

CREATE TABLE IF NOT EXISTS lingo_profiles (
    issuer TEXT NOT NULL,
    subject TEXT NOT NULL,
    display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 80),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (issuer, subject)
);

CREATE TABLE IF NOT EXISTS lingo_outbox_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_type TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    schema_version INTEGER NOT NULL CHECK (schema_version > 0),
    payload JSONB NOT NULL,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    published_at TIMESTAMPTZ,
    attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0)
);

CREATE INDEX IF NOT EXISTS lingo_outbox_unpublished_idx
    ON lingo_outbox_events (occurred_at, id)
    WHERE published_at IS NULL;

COMMIT;
