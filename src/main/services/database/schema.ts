import type { Database } from 'better-sqlite3';

export const SCHEMA_SQL = `
-- Pragmas
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;

-- 1. Items table
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    sha256_hash TEXT NOT NULL UNIQUE,
    filename TEXT NOT NULL,
    original_path TEXT NOT NULL,
    ext TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    is_animated INTEGER NOT NULL DEFAULT 0,
    frame_count INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_hash ON items(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_items_animated ON items(is_animated);

-- 2. Variants table
CREATE TABLE IF NOT EXISTS variants (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK(tier IN ('raw', 'sticker', 'emoji', 'thumb')),
    file_path TEXT NOT NULL,
    format TEXT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, tier)
);

CREATE INDEX IF NOT EXISTS idx_variants_item_tier ON variants(item_id, tier);

-- 3. Metadata table
CREATE TABLE IF NOT EXISTS metadata (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL UNIQUE REFERENCES items(id) ON DELETE CASCADE,
    character TEXT,
    source_origin TEXT,
    action TEXT,
    feeling TEXT,
    description TEXT,
    ai_model TEXT,
    ai_status TEXT DEFAULT 'pending' CHECK(ai_status IN ('pending', 'processing', 'completed', 'failed', 'manual_only')),
    ai_error TEXT,
    raw_ai_json TEXT,
    user_locked_fields TEXT DEFAULT '[]',
    is_user_edited INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_metadata_character ON metadata(character);
CREATE INDEX IF NOT EXISTS idx_metadata_source ON metadata(source_origin);
CREATE INDEX IF NOT EXISTS idx_metadata_ai_status ON metadata(ai_status);

-- 4. Tags and Item-Tags
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE
);

CREATE TABLE IF NOT EXISTS item_tags (
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    is_ai_generated INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (item_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_item_tags_tag ON item_tags(tag_id);

-- 5. Custom Attributes
CREATE TABLE IF NOT EXISTS custom_attributes (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    attribute_key TEXT NOT NULL,
    attribute_value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_custom_attr_item ON custom_attributes(item_id);

-- 6. Usage Stats
CREATE TABLE IF NOT EXISTS usage_stats (
    item_id TEXT PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
    is_favorite INTEGER NOT NULL DEFAULT 0,
    copy_count INTEGER NOT NULL DEFAULT 0,
    last_copied_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usage_favorite ON usage_stats(is_favorite);
CREATE INDEX IF NOT EXISTS idx_usage_recent ON usage_stats(last_copied_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_count ON usage_stats(copy_count DESC);

-- 7. Full-Text Search (FTS5)
CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(
    item_id UNINDEXED,
    character,
    source_origin,
    action,
    feeling,
    description,
    tags_aggregated,
    tokenize = 'unicode61 remove_diacritics 2'
);

-- Triggers to synchronize FTS5 index
CREATE TRIGGER IF NOT EXISTS trg_metadata_after_insert AFTER INSERT ON metadata
BEGIN
    INSERT INTO items_fts (item_id, character, source_origin, action, feeling, description, tags_aggregated)
    VALUES (
        new.item_id,
        coalesce(new.character, ''),
        coalesce(new.source_origin, ''),
        coalesce(new.action, ''),
        coalesce(new.feeling, ''),
        coalesce(new.description, ''),
        (SELECT group_concat(t.name, ' ') FROM item_tags it JOIN tags t ON t.id = it.tag_id WHERE it.item_id = new.item_id)
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_metadata_after_update AFTER UPDATE ON metadata
BEGIN
    DELETE FROM items_fts WHERE item_id = old.item_id;
    INSERT INTO items_fts (item_id, character, source_origin, action, feeling, description, tags_aggregated)
    VALUES (
        new.item_id,
        coalesce(new.character, ''),
        coalesce(new.source_origin, ''),
        coalesce(new.action, ''),
        coalesce(new.feeling, ''),
        coalesce(new.description, ''),
        (SELECT group_concat(t.name, ' ') FROM item_tags it JOIN tags t ON t.id = it.tag_id WHERE it.item_id = new.item_id)
    );
END;

CREATE TRIGGER IF NOT EXISTS trg_metadata_after_delete AFTER DELETE ON metadata
BEGIN
    DELETE FROM items_fts WHERE item_id = old.item_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_item_tags_after_insert AFTER INSERT ON item_tags
BEGIN
    DELETE FROM items_fts WHERE item_id = new.item_id;
    INSERT INTO items_fts (item_id, character, source_origin, action, feeling, description, tags_aggregated)
    SELECT
        m.item_id,
        coalesce(m.character, ''),
        coalesce(m.source_origin, ''),
        coalesce(m.action, ''),
        coalesce(m.feeling, ''),
        coalesce(m.description, ''),
        (SELECT group_concat(t.name, ' ') FROM item_tags it JOIN tags t ON t.id = it.tag_id WHERE it.item_id = new.item_id)
    FROM metadata m WHERE m.item_id = new.item_id;
END;

CREATE TRIGGER IF NOT EXISTS trg_item_tags_after_delete AFTER DELETE ON item_tags
BEGIN
    DELETE FROM items_fts WHERE item_id = old.item_id;
    INSERT INTO items_fts (item_id, character, source_origin, action, feeling, description, tags_aggregated)
    SELECT
        m.item_id,
        coalesce(m.character, ''),
        coalesce(m.source_origin, ''),
        coalesce(m.action, ''),
        coalesce(m.feeling, ''),
        coalesce(m.description, ''),
        (SELECT group_concat(t.name, ' ') FROM item_tags it JOIN tags t ON t.id = it.tag_id WHERE it.item_id = old.item_id)
    FROM metadata m WHERE m.item_id = old.item_id;
END;
`;

export function initializeSchema(db: Database): void {
  db.exec(SCHEMA_SQL);

  // Safe migrations for existing databases
  try {
    db.exec(`ALTER TABLE metadata ADD COLUMN user_locked_fields TEXT DEFAULT '[]'`);
  } catch {}
  try {
    db.exec(`ALTER TABLE metadata ADD COLUMN is_user_edited INTEGER DEFAULT 0`);
  } catch {}
}
