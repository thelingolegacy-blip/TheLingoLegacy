-- Staging-only additive migration. Preserve existing sessions and legacy tables.
-- Existing rows receive an empty digest and will not be replayed under the new
-- ruleset contract; new settlements must persist the exact SHA-256 ruleset digest.
ALTER TABLE lingo_game_sessions
  ADD COLUMN ruleset_digest TEXT NOT NULL DEFAULT ''
  CHECK (
    ruleset_digest = ''
    OR (
      length(ruleset_digest) = 64
      AND ruleset_digest NOT GLOB '*[^0-9a-f]*'
    )
  );
