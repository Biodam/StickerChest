import type { Database } from 'better-sqlite3';
import { UsageStats } from '../../../types/models';

export function toggleFavorite(db: Database, itemId: string, forceState?: boolean): boolean {
  const current = db.prepare(`SELECT is_favorite FROM usage_stats WHERE item_id = ?`).get(itemId) as { is_favorite: number } | undefined;
  
  const newState = forceState !== undefined 
    ? (forceState ? 1 : 0) 
    : (current && current.is_favorite === 1 ? 0 : 1);

  db.prepare(`
    INSERT INTO usage_stats (item_id, is_favorite, copy_count)
    VALUES (?, ?, 0)
    ON CONFLICT(item_id) DO UPDATE SET
      is_favorite = excluded.is_favorite
  `).run(itemId, newState);

  return newState === 1;
}

export function recordItemUsage(db: Database, itemId: string): void {
  db.prepare(`
    INSERT INTO usage_stats (item_id, is_favorite, copy_count, last_copied_at)
    VALUES (?, 0, 1, CURRENT_TIMESTAMP)
    ON CONFLICT(item_id) DO UPDATE SET
      copy_count = usage_stats.copy_count + 1,
      last_copied_at = CURRENT_TIMESTAMP
  `).run(itemId);
}

export function getUsageStats(db: Database, itemId: string): UsageStats {
  const row = db.prepare(`SELECT * FROM usage_stats WHERE item_id = ?`).get(itemId) as any;
  return {
    itemId,
    isFavorite: (row?.is_favorite ?? 0) === 1,
    copyCount: row?.copy_count ?? 0,
    lastCopiedAt: row?.last_copied_at ?? null,
  };
}
