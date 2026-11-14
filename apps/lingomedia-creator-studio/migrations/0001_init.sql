CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 160),
  kind TEXT NOT NULL CHECK(kind IN ('Video', 'Audio', 'Image', 'Document')),
  status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Published', 'Processing')),
  creator TEXT NOT NULL CHECK(length(creator) BETWEEN 1 AND 80),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS media_created_at_idx ON media(created_at DESC);