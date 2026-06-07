-- ═══════════════════════════════════════════════════════════════
--  Migration: 009_price_change_tracker
--  Tracks when Google Sheet prices actually changed (not just fetched).
--  Used by the Next.js ISR fetcher to show an accurate "last changed" timestamp.
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS price_snapshots (
  key         TEXT        PRIMARY KEY,
  price_hash  TEXT        NOT NULL DEFAULT '',
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No user data → RLS not needed
ALTER TABLE price_snapshots DISABLE ROW LEVEL SECURITY;

-- Seed the initial row so the first read always finds a record
INSERT INTO price_snapshots (key, price_hash, changed_at)
VALUES ('frame_prices', '', NOW())
ON CONFLICT (key) DO NOTHING;
