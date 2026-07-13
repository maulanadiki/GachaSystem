CREATE TABLE IF NOT EXISTS gacha_history (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL REFERENCES users(username),
  item_id INTEGER NOT NULL REFERENCES gacha_items(id),
  item_name TEXT NOT NULL,
  rarity TEXT NOT NULL,
  drop_rate_snapshot NUMERIC(6,4) NOT NULL,
  cost NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);