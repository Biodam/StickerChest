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
    const existing = db.prepare(`SELECT * FROM metadata WHERE item_id = ?`).get(input.itemId) as any;
    const id = existing?.id || randomUUID();

    let existingLocked: string[] = [];
    try {
      if (existing?.user_locked_fields) {
        existingLocked = JSON.parse(existing.user_locked_fields);
      }
    } catch {}

    const isUserEdit = input.isUserEdited === true;

    // Calculate updated locked fields
    let userLockedFields = existingLocked;
    if (isUserEdit) {
      const newLocked = new Set(existingLocked);
      if (input.userLockedFields && input.userLockedFields.length > 0) {
        input.userLockedFields.forEach((f) => newLocked.add(f));
      } else {
        if (input.character !== undefined && input.character !== null) newLocked.add('character');
        if (input.sourceOrigin !== undefined && input.sourceOrigin !== null) newLocked.add('source_origin');
        if (input.action !== undefined && input.action !== null) newLocked.add('action');
        if (input.feeling !== undefined && input.feeling !== null) newLocked.add('feeling');
        if (input.description !== undefined && input.description !== null) newLocked.add('description');
      }
      userLockedFields = Array.from(newLocked);
    }

    // Protection logic: if AI is writing, never overwrite user-locked fields!
    const character = !isUserEdit && userLockedFields.includes('character')
      ? (existing?.character ?? null)
      : (input.character ?? existing?.character ?? null);

    const sourceOrigin = !isUserEdit && userLockedFields.includes('source_origin')
      ? (existing?.source_origin ?? null)
      : (input.sourceOrigin ?? existing?.source_origin ?? null);

    const action = !isUserEdit && userLockedFields.includes('action')
      ? (existing?.action ?? null)
      : (input.action ?? existing?.action ?? null);

    const feeling = !isUserEdit && userLockedFields.includes('feeling')
      ? (existing?.feeling ?? null)
      : (input.feeling ?? existing?.feeling ?? null);

    const description = !isUserEdit && userLockedFields.includes('description')
      ? (existing?.description ?? null)
      : (input.description ?? existing?.description ?? null);

    const isUserEdited = isUserEdit ? 1 : (existing?.is_user_edited ?? 0);
    const lockedJson = JSON.stringify(userLockedFields);

    // Save tags: user edit marks tags with is_ai_generated = 0, AI never touches user tags
    if (input.tags) {
      if (isUserEdit) {
        setTags(db, input.itemId, input.tags, false);
      } else {
        applyAiTags(db, input.itemId, input.tags);
      }
    }

    if (input.customAttributes) {
      setCustomAttributes(db, input.itemId, input.customAttributes);
    }

    const stmt = db.prepare(`
      INSERT INTO metadata (
        id, item_id, character, source_origin, action, feeling, description,
        ai_model, ai_status, ai_error, raw_ai_json, user_locked_fields, is_user_edited, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
      ) ON CONFLICT(item_id) DO UPDATE SET
        character = excluded.character,
        source_origin = excluded.source_origin,
        action = excluded.action,
        feeling = excluded.feeling,
        description = excluded.description,
        ai_model = coalesce(excluded.ai_model, metadata.ai_model),
        ai_status = excluded.ai_status,
        ai_error = excluded.ai_error,
        raw_ai_json = coalesce(excluded.raw_ai_json, metadata.raw_ai_json),
        user_locked_fields = excluded.user_locked_fields,
        is_user_edited = excluded.is_user_edited,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      id,
      input.itemId,
      character,
      sourceOrigin,
      action,
      feeling,
      description,
      input.aiModel ?? existing?.ai_model ?? null,
      input.aiStatus ?? existing?.ai_status ?? 'completed',
      input.aiError ?? null,
      input.rawAiJson ?? existing?.raw_ai_json ?? null,
      lockedJson,
      isUserEdited
    );

    syncFtsIndex(db, input.itemId);
  });

  transaction();
}

export function applyAiTags(db: Database, itemId: string, aiTags: string[]): void {
  const insertTagStmt = db.prepare(`INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)`);
  const getTagStmt = db.prepare(`SELECT id FROM tags WHERE name = ? COLLATE NOCASE`);
  const linkStmt = db.prepare(`
    INSERT INTO item_tags (item_id, tag_id, is_ai_generated) VALUES (?, ?, 1)
    ON CONFLICT(item_id, tag_id) DO UPDATE SET
      is_ai_generated = CASE WHEN item_tags.is_ai_generated = 0 THEN 0 ELSE 1 END
  `);

  const transaction = db.transaction((tags: string[]) => {
    // Only delete previous AI tags; NEVER delete user tags (is_ai_generated = 0)
    db.prepare(`DELETE FROM item_tags WHERE item_id = ? AND is_ai_generated = 1`).run(itemId);

    for (const rawTag of tags) {
      const cleanTag = rawTag.trim().toLowerCase();
      if (!cleanTag) continue;

      insertTagStmt.run(randomUUID(), cleanTag);
      const tagRow = getTagStmt.get(cleanTag) as { id: string } | undefined;
      if (tagRow) {
        linkStmt.run(itemId, tagRow.id);
      }
    }
    syncFtsIndex(db, itemId);
  });

  transaction(aiTags);
}

export function setTags(db: Database, itemId: string, tags: string[], isAiGenerated = false): void {
  const insertTagStmt = db.prepare(`INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)`);
  const getTagStmt = db.prepare(`SELECT id FROM tags WHERE name = ? COLLATE NOCASE`);
  const linkStmt = db.prepare(`
    INSERT INTO item_tags (item_id, tag_id, is_ai_generated) VALUES (?, ?, ?)
    ON CONFLICT(item_id, tag_id) DO UPDATE SET
      is_ai_generated = excluded.is_ai_generated
  `);

  const transaction = db.transaction((tagList: string[]) => {
    if (!isAiGenerated) {
      const cleanList = tagList.map((t) => t.trim().toLowerCase()).filter(Boolean);
      const allItemTags = db.prepare(`
        SELECT t.id, t.name, it.is_ai_generated
        FROM item_tags it
        JOIN tags t ON t.id = it.tag_id
        WHERE it.item_id = ?
      `).all(itemId) as { id: string; name: string; is_ai_generated: number }[];

      for (const existingTag of allItemTags) {
        if (!cleanList.includes(existingTag.name.toLowerCase())) {
          db.prepare(`DELETE FROM item_tags WHERE item_id = ? AND tag_id = ?`).run(itemId, existingTag.id);
        }
      }
    }

    for (const rawTag of tagList) {
      const cleanTag = rawTag.trim().toLowerCase();
      if (!cleanTag) continue;

      insertTagStmt.run(randomUUID(), cleanTag);
      const tagRow = getTagStmt.get(cleanTag) as { id: string } | undefined;
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
