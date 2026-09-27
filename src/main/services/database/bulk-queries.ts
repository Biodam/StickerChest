import type { Database } from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { syncFtsIndex } from './metadata-queries';

export function bulkDeleteItems(db: Database, itemIds: string[]): number {
  if (itemIds.length === 0) return 0;
  const deleteStmt = db.prepare(`DELETE FROM items WHERE id = ?`);
  const transaction = db.transaction((ids: string[]) => {
    let count = 0;
    for (const id of ids) {
      const res = deleteStmt.run(id);
      count += res.changes;
    }
    return count;
  });
  return transaction(itemIds);
}

export function bulkAddTags(db: Database, itemIds: string[], tags: string[]): void {
  if (itemIds.length === 0 || tags.length === 0) return;
  const insertTagStmt = db.prepare(`INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)`);
  const getTagStmt = db.prepare(`SELECT id FROM tags WHERE name = ? COLLATE NOCASE`);
  const linkStmt = db.prepare(`
    INSERT INTO item_tags (item_id, tag_id, is_ai_generated) VALUES (?, ?, 0)
    ON CONFLICT(item_id, tag_id) DO UPDATE SET is_ai_generated = 0
  `);

  const transaction = db.transaction(() => {
    const tagIds: string[] = [];
    for (const tag of tags) {
      const clean = tag.trim().toLowerCase();
      if (!clean) continue;
      insertTagStmt.run(randomUUID(), clean);
      const row = getTagStmt.get(clean) as { id: string } | undefined;
      if (row) tagIds.push(row.id);
    }

    for (const itemId of itemIds) {
      for (const tagId of tagIds) {
        linkStmt.run(itemId, tagId);
      }
      syncFtsIndex(db, itemId);
    }
  });

  transaction();
}

export function bulkRemoveTags(db: Database, itemIds: string[], tags: string[]): void {
  if (itemIds.length === 0 || tags.length === 0) return;
  const getTagStmt = db.prepare(`SELECT id FROM tags WHERE name = ? COLLATE NOCASE`);
  const unlinkStmt = db.prepare(`DELETE FROM item_tags WHERE item_id = ? AND tag_id = ?`);

  const transaction = db.transaction(() => {
    const tagIds: string[] = [];
    for (const tag of tags) {
      const clean = tag.trim().toLowerCase();
      const row = getTagStmt.get(clean) as { id: string } | undefined;
      if (row) tagIds.push(row.id);
    }

    for (const itemId of itemIds) {
      for (const tagId of tagIds) {
        unlinkStmt.run(itemId, tagId);
      }
      syncFtsIndex(db, itemId);
    }
  });

  transaction();
}

export function bulkToggleFavorite(db: Database, itemIds: string[], favorite: boolean): void {
  if (itemIds.length === 0) return;
  const stmt = db.prepare(`
    INSERT INTO usage_stats (item_id, is_favorite) VALUES (?, ?)
    ON CONFLICT(item_id) DO UPDATE SET is_favorite = excluded.is_favorite
  `);

  const transaction = db.transaction((ids: string[], fav: number) => {
    for (const id of ids) {
      stmt.run(id, fav);
    }
  });

  transaction(itemIds, favorite ? 1 : 0);
}

export function bulkSetCustomAttribute(db: Database, itemIds: string[], key: string, value: string): void {
  if (itemIds.length === 0 || !key) return;
  const deleteStmt = db.prepare(`DELETE FROM custom_attributes WHERE item_id = ? AND attribute_key = ?`);
  const insertStmt = db.prepare(`
    INSERT INTO custom_attributes (id, item_id, attribute_key, attribute_value)
    VALUES (?, ?, ?, ?)
  `);

  const transaction = db.transaction(() => {
    for (const id of itemIds) {
      deleteStmt.run(id, key);
      if (value !== '') {
        insertStmt.run(randomUUID(), id, key, value);
      }
    }
  });

  transaction();
}
