import type { Database } from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { MetadataUpsertInput } from './types';

export function syncFtsIndex(db: Database, itemId: string): void {
  db.prepare(`DELETE FROM items_fts WHERE item_id = ?`).run(itemId);
  db.prepare(`
    INSERT INTO items_fts (item_id, character, source_origin, action, feeling, description, tags_aggregated)
    SELECT
      m.item_id,
      coalesce(m.character, ''),
      coalesce(m.source_origin, ''),
      coalesce(m.action, ''),
      coalesce(m.feeling, ''),
      coalesce(m.description, ''),
      (SELECT group_concat(t.name, ' ') FROM item_tags it JOIN tags t ON t.id = it.tag_id WHERE it.item_id = m.item_id)
    FROM metadata m
    WHERE m.item_id = ?
  `).run(itemId);
}

export function upsertMetadata(db: Database, input: MetadataUpsertInput): void {
  const transaction = db.transaction(() => {
    // 1. If tags provided, insert tags first so they are present for FTS
    if (input.tags && input.tags.length > 0) {
      setTags(db, input.itemId, input.tags, input.aiStatus !== 'manual_only');
    }

    if (input.customAttributes) {
      setCustomAttributes(db, input.itemId, input.customAttributes);
    }

    const existing = db.prepare(`SELECT id FROM metadata WHERE item_id = ?`).get(input.itemId) as { id: string } | undefined;
    const id = existing?.id || randomUUID();

    const stmt = db.prepare(`
      INSERT INTO metadata (
        id, item_id, character, source_origin, action, feeling, description,
        ai_model, ai_status, ai_error, raw_ai_json, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
      ) ON CONFLICT(item_id) DO UPDATE SET
        character = coalesce(excluded.character, metadata.character),
        source_origin = coalesce(excluded.source_origin, metadata.source_origin),
        action = coalesce(excluded.action, metadata.action),
        feeling = coalesce(excluded.feeling, metadata.feeling),
        description = coalesce(excluded.description, metadata.description),
        ai_model = coalesce(excluded.ai_model, metadata.ai_model),
        ai_status = coalesce(excluded.ai_status, metadata.ai_status),
        ai_error = excluded.ai_error,
        raw_ai_json = coalesce(excluded.raw_ai_json, metadata.raw_ai_json),
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      id,
      input.itemId,
      input.character ?? null,
      input.sourceOrigin ?? null,
      input.action ?? null,
      input.feeling ?? null,
      input.description ?? null,
      input.aiModel ?? null,
      input.aiStatus ?? 'completed',
      input.aiError ?? null,
      input.rawAiJson ?? null
    );

    // Explicitly sync FTS index
    syncFtsIndex(db, input.itemId);
  });

  transaction();
}

export function setTags(db: Database, itemId: string, tags: string[], isAiGenerated = true): void {
  const insertTagStmt = db.prepare(`INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)`);
  const getTagStmt = db.prepare(`SELECT id FROM tags WHERE name = ? COLLATE NOCASE`);
  const linkStmt = db.prepare(`INSERT OR REPLACE INTO item_tags (item_id, tag_id, is_ai_generated) VALUES (?, ?, ?)`);

  const transaction = db.transaction((tagList: string[]) => {
    for (const rawTag of tagList) {
      const cleanTag = rawTag.trim().toLowerCase();
      if (!cleanTag) continue;

      insertTagStmt.run(randomUUID(), cleanTag);
      const tagRow = getTagStmt.get(cleanTag) as { id: string };
      if (tagRow) {
        linkStmt.run(itemId, tagRow.id, isAiGenerated ? 1 : 0);
      }
    }
    syncFtsIndex(db, itemId);
  });

  transaction(tags);
}

export function removeTag(db: Database, itemId: string, tagName: string): void {
  const tagRow = db.prepare(`SELECT id FROM tags WHERE name = ? COLLATE NOCASE`).get(tagName) as { id: string } | undefined;
  if (tagRow) {
    db.prepare(`DELETE FROM item_tags WHERE item_id = ? AND tag_id = ?`).run(itemId, tagRow.id);
    syncFtsIndex(db, itemId);
  }
}

export function setCustomAttributes(db: Database, itemId: string, attributes: Record<string, string>): void {
  const insertStmt = db.prepare(`
    INSERT INTO custom_attributes (id, item_id, attribute_key, attribute_value)
    VALUES (?, ?, ?, ?)
  `);

  const deleteStmt = db.prepare(`DELETE FROM custom_attributes WHERE item_id = ? AND attribute_key = ?`);

  const transaction = db.transaction((attrs: Record<string, string>) => {
    for (const [key, value] of Object.entries(attrs)) {
      deleteStmt.run(itemId, key);
      if (value !== undefined && value !== null && value !== '') {
        insertStmt.run(randomUUID(), itemId, key, String(value));
      }
    }
  });

  transaction(attributes);
}
