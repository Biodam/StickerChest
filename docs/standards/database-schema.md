# Database Schema Specification (SQLite 3 + FTS5)

This document specifies the relational database schema, indexes, triggers, and full-text search (FTS5) configuration for StickerVault.

---

## 1. Relational Tables

### 1.1 `items`
Primary catalog of unique ingested assets.
```sql
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,                       -- UUID v4
    sha256_hash TEXT NOT NULL UNIQUE,          -- SHA-256 for deduplication
    filename TEXT NOT NULL,                    -- Original file name
    original_path TEXT NOT NULL,               -- Source location
    ext TEXT NOT NULL,                         -- Extension (.png, .gif, etc.)
    mime_type TEXT NOT NULL,                   -- e.g. 'image/gif'
    width INTEGER NOT NULL,                    -- Original pixel width
    height INTEGER NOT NULL,                   -- Original pixel height
    file_size_bytes INTEGER NOT NULL,          -- Original file size
    is_animated INTEGER NOT NULL DEFAULT 0,    -- 1 if GIF/APNG/WebP animated
    frame_count INTEGER DEFAULT 1,             -- Number of animation frames
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_hash ON items(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_items_animated ON items(is_animated);
```

### 1.2 `variants`
Resized file variants created for each item (`sticker`, `emoji`, `thumb`).
```sql
CREATE TABLE IF NOT EXISTS variants (
    id TEXT PRIMARY KEY,                       -- UUID v4
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    tier TEXT NOT NULL CHECK(tier IN ('raw', 'sticker', 'emoji', 'thumb')),
    file_path TEXT NOT NULL,                   -- Relative path inside vault
    format TEXT NOT NULL,                      -- 'webp', 'gif', 'png'
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, tier)
);

CREATE INDEX IF NOT EXISTS idx_variants_item_tier ON variants(item_id, tier);
```

### 1.3 `metadata`
AI-generated and manual core descriptive metadata.
```sql
CREATE TABLE IF NOT EXISTS metadata (
    id TEXT PRIMARY KEY,                       -- UUID v4
    item_id TEXT NOT NULL UNIQUE REFERENCES items(id) ON DELETE CASCADE,
    character TEXT,                            -- Fictional/Real Character name
    source_origin TEXT,                        -- Anime, Game, Meme origin
    action TEXT,                               -- Physical gesture / action
    feeling TEXT,                              -- Mood / emotion / vibe
    description TEXT,                          -- Natural language summary
    ai_model TEXT,                             -- e.g. 'gemini-2.5-flash'
    ai_status TEXT DEFAULT 'pending' CHECK(ai_status IN ('pending', 'processing', 'completed', 'failed', 'manual_only')),
    ai_error TEXT,
    raw_ai_json TEXT,                          -- Full raw AI payload
    user_locked_fields TEXT DEFAULT '[]',      -- JSON array of user-locked field names protected from AI overwrite
    is_user_edited INTEGER DEFAULT 0,          -- 1 if user manually edited metadata or tags
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_metadata_character ON metadata(character);
CREATE INDEX IF NOT EXISTS idx_metadata_source ON metadata(source_origin);
CREATE INDEX IF NOT EXISTS idx_metadata_ai_status ON metadata(ai_status);
CREATE INDEX IF NOT EXISTS idx_metadata_user_edited ON metadata(is_user_edited);
```

### 1.4 `tags` & `item_tags`
Search tags with origin tracking.
```sql
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
```

### 1.5 `custom_attributes`
User-configured key-value pairs.
```sql
CREATE TABLE IF NOT EXISTS custom_attributes (
    id TEXT PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    attribute_key TEXT NOT NULL,
    attribute_value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_custom_attr_item ON custom_attributes(item_id);
CREATE INDEX IF NOT EXISTS idx_custom_attr_key_val ON custom_attributes(attribute_key, attribute_value);
```

### 1.6 `usage_stats`
Tracks favorites and usage frequency to power the Quick Picker tabs and search ranking.
```sql
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
```

---

## 2. Full-Text Search (FTS5)

To provide instant (<5ms) prefix and phrase search across all metadata dimensions, an FTS5 virtual table is maintained:

```sql
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
```

### Synchronization Triggers
Automatic SQLite triggers keep `items_fts` synchronized whenever `metadata` or `item_tags` are updated.

```sql
-- Trigger on metadata insert
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

-- Trigger on metadata update
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

-- Trigger on metadata delete
CREATE TRIGGER IF NOT EXISTS trg_metadata_after_delete AFTER DELETE ON metadata
BEGIN
    DELETE FROM items_fts WHERE item_id = old.item_id;
END;
```

---

## 3. Database Pragmas & Performance

For desktop reliability and concurrency between the Main Manager window and the Quick Picker modal:
```sql
PRAGMA journal_mode = WAL;          -- Write-Ahead Logging allows concurrent reads & writes
PRAGMA synchronous = NORMAL;         -- High performance with disk durability
PRAGMA foreign_keys = ON;            -- Enforce relational cascades
PRAGMA cache_size = -64000;          -- 64MB memory page cache for instant lookups
```
