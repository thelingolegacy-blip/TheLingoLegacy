-- Homies initial relational schema
-- PostgreSQL 15+ with PostGIS. Apply through a controlled migration process.
-- Do not apply directly to production without backup, review, and migration testing.
-- Extension creation may require database-owner privileges.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id TEXT NOT NULL UNIQUE,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended', 'deleted', 'pending_deletion')),
  last_active TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (length(btrim(display_name)) BETWEEN 1 AND 80),
  bio TEXT CHECK (bio IS NULL OR length(bio) <= 2000),
  birthdate DATE NOT NULL,
  height_cm SMALLINT CHECK (height_cm IS NULL OR height_cm BETWEEN 50 AND 260),
  body_type TEXT,
  position TEXT,
  goals TEXT[] NOT NULL DEFAULT '{}',
  tribe TEXT[] NOT NULL DEFAULT '{}',
  interests TEXT[] NOT NULL DEFAULT '{}',
  location GEOGRAPHY(POINT, 4326),
  location_fuzzed GEOGRAPHY(POINT, 4326),
  privacy_settings JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(privacy_settings) = 'object'),
  verification_status TEXT NOT NULL DEFAULT 'none'
    CHECK (verification_status IN ('none', 'photo', 'id', 'rejected', 'review')),
  trust_score SMALLINT NOT NULL DEFAULT 50 CHECK (trust_score BETWEEN 0 AND 100),
  is_traveling BOOLEAN NOT NULL DEFAULT FALSE,
  boost_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  blur_url TEXT,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'voice')),
  sort_order SMALLINT NOT NULL DEFAULT 0 CHECK (sort_order >= 0),
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  moderation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'review', 'removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  age_min SMALLINT NOT NULL DEFAULT 18 CHECK (age_min >= 18),
  age_max SMALLINT NOT NULL DEFAULT 99 CHECK (age_max >= age_min AND age_max <= 120),
  max_distance_km INT NOT NULL DEFAULT 50 CHECK (max_distance_km BETWEEN 1 AND 10000),
  filters JSONB NOT NULL DEFAULT '{}'::jsonb
    CHECK (jsonb_typeof(filters) = 'object')
);

CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'like' CHECK (type IN ('like', 'superlike')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT likes_no_self CHECK (from_user <> to_user),
  UNIQUE (from_user, to_user)
);

-- Store each pair in canonical UUID order (user_a < user_b).
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT matches_canonical_pair CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE conversation_members (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  content TEXT,
  type TEXT NOT NULL DEFAULT 'text'
    CHECK (type IN ('text', 'image', 'voice', 'system')),
  metadata JSONB CHECK (metadata IS NULL OR jsonb_typeof(metadata) = 'object'),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT message_has_payload CHECK (
    (type = 'system') OR
    (content IS NOT NULL AND length(content) BETWEEN 1 AND 20000) OR
    (type IN ('image', 'voice') AND metadata IS NOT NULL)
  )
);

CREATE TABLE blocks (
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT blocks_no_self CHECK (blocker_id <> blocked_id),
  PRIMARY KEY (blocker_id, blocked_id)
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reported_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  reason TEXT NOT NULL CHECK (length(btrim(reason)) BETWEEN 1 AND 100),
  details TEXT CHECK (details IS NULL OR length(details) <= 10000),
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'triaged', 'investigating', 'actioned', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  CONSTRAINT reports_no_self CHECK (reporter_id <> reported_id)
);

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'plus', 'black')),
  status TEXT NOT NULL
    CHECK (status IN ('incomplete', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'incomplete_expired', 'paused')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE entitlements (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature TEXT NOT NULL CHECK (length(btrim(feature)) BETWEEN 1 AND 120),
  expires_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'subscription'
    CHECK (source IN ('subscription', 'purchase', 'promotion', 'admin')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, feature)
);

CREATE TABLE circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (length(btrim(name)) BETWEEN 1 AND 120),
  description TEXT CHECK (description IS NULL OR length(description) <= 4000),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  is_private BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE circle_members (
  circle_id UUID NOT NULL REFERENCES circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (circle_id, user_id)
);

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 200),
  description TEXT CHECK (description IS NULL OR length(description) <= 10000),
  location GEOGRAPHY(POINT, 4326),
  start_time TIMESTAMPTZ NOT NULL,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Separate, consent-governed Grok history. Do not copy private chat history by default.
CREATE TABLE grok_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  context_sharing_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE grok_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES grok_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 20000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotency ledger for Stripe webhook processing.
CREATE TABLE stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processing', 'processed', 'failed')),
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  failure_code TEXT
);

-- Indexes: no time-dependent predicates (NOW() is not immutable).
CREATE INDEX idx_profiles_location ON profiles USING GIST (location);
CREATE INDEX idx_profiles_fuzzed_location ON profiles USING GIST (location_fuzzed);
CREATE INDEX idx_profiles_last_active ON profiles (user_id, updated_at DESC);
CREATE INDEX idx_profiles_display_name_trgm ON profiles USING GIN (display_name gin_trgm_ops);
CREATE INDEX idx_profiles_boost_expires ON profiles (boost_expires_at) WHERE boost_expires_at IS NOT NULL;
CREATE INDEX idx_media_user_order ON media (user_id, sort_order);
CREATE INDEX idx_media_moderation ON media (moderation_status, created_at);
CREATE INDEX idx_likes_to_user_time ON likes (to_user, created_at DESC);
CREATE INDEX idx_matches_user_a_time ON matches (user_a, created_at DESC);
CREATE INDEX idx_matches_user_b_time ON matches (user_b, created_at DESC);
CREATE INDEX idx_conversation_members_user ON conversation_members (user_id, joined_at DESC);
CREATE INDEX idx_messages_conv_time ON messages (conversation_id, created_at DESC);
CREATE INDEX idx_messages_expiry ON messages (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_reports_status_time ON reports (status, created_at DESC);
CREATE INDEX idx_subscriptions_user_status ON subscriptions (user_id, status);
CREATE INDEX idx_entitlements_expiry ON entitlements (expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_circle_members_user ON circle_members (user_id, joined_at DESC);
CREATE INDEX idx_events_start_time ON events (start_time);
CREATE INDEX idx_events_location ON events USING GIST (location);
CREATE INDEX idx_grok_conversations_user ON grok_conversations (user_id, created_at DESC);
CREATE INDEX idx_grok_messages_conversation_time ON grok_messages (conversation_id, created_at);
CREATE INDEX idx_stripe_webhook_status_time ON stripe_webhook_events (processing_status, received_at);

-- Maintain updated_at on mutable entities.
CREATE FUNCTION homies_set_updated_at() RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION homies_set_updated_at();
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION homies_set_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION homies_set_updated_at();

COMMIT;
