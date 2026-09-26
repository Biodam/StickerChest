import type { Database } from 'better-sqlite3';
import { SearchFilterOptions, StickerItem } from '../../../types/models';
import { ItemRow } from './types';
import { hydrateItem } from './item-queries';

export function sanitizeFtsQuery(raw: string): string {
  // Strip special FTS5 operators and punctuation, tokenize words, append wildcard * for prefix search
  const tokens = raw
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (tokens.length === 0) return '';
  return tokens.map((t) => `"${t}"*`).join(' ');
}

export function searchItems(
  db: Database,
  options: SearchFilterOptions
): { items: StickerItem[]; total: number } {
  const {
    query = '',
    tab = 'all',
    character,
    sourceOrigin,
    feeling,
    tag,
    isAnimated,
    limit = 50,
    offset = 0,
  } = options;

  const conditions: string[] = [];
  const params: any[] = [];
  const ftsSearch = sanitizeFtsQuery(query);

  let fromClause = `
    FROM items i
    LEFT JOIN metadata m ON m.item_id = i.id
    LEFT JOIN usage_stats u ON u.item_id = i.id
  `;

  if (ftsSearch) {
    fromClause += ` JOIN items_fts fts ON fts.item_id = i.id AND items_fts MATCH ?`;
    params.push(ftsSearch);
  }

  // Tab conditions
  if (tab === 'favorites') {
    conditions.push(`u.is_favorite = 1`);
  } else if (tab === 'recent') {
    conditions.push(`u.last_copied_at IS NOT NULL`);
  }

  // Filter conditions
  if (character) {
    conditions.push(`m.character = ? COLLATE NOCASE`);
    params.push(character);
  }
  if (sourceOrigin) {
    conditions.push(`m.source_origin = ? COLLATE NOCASE`);
    params.push(sourceOrigin);
  }
  if (feeling) {
    conditions.push(`m.feeling = ? COLLATE NOCASE`);
    params.push(feeling);
  }
  if (tag) {
    conditions.push(`EXISTS (
      SELECT 1 FROM item_tags it
      JOIN tags t ON t.id = it.tag_id
      WHERE it.item_id = i.id AND t.name = ? COLLATE NOCASE
    )`);
    params.push(tag);
  }
  if (isAnimated !== undefined) {
    conditions.push(`i.is_animated = ?`);
    params.push(isAnimated ? 1 : 0);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total matching items
  const countSql = `SELECT COUNT(DISTINCT i.id) as total ${fromClause} ${whereClause}`;
  const totalRow = db.prepare(countSql).get(...params) as { total: number };
  const total = totalRow?.total ?? 0;

  if (total === 0) {
    return { items: [], total: 0 };
  }

  // Order By clause
  let orderBy = 'ORDER BY i.created_at DESC';
  if (tab === 'recent') {
    orderBy = 'ORDER BY u.last_copied_at DESC';
  } else if (ftsSearch) {
    // Rank by BM25 relevance score when searching
    orderBy = 'ORDER BY rank, u.copy_count DESC';
  } else if (tab === 'favorites') {
    orderBy = 'ORDER BY u.last_copied_at DESC NULLS LAST, i.created_at DESC';
  }

  const selectSql = `
    SELECT DISTINCT i.*
    ${fromClause}
    ${whereClause}
    ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const rows = db.prepare(selectSql).all(...params, limit, offset) as ItemRow[];
  const items = rows.map((row) => hydrateItem(db, row));

  return { items, total };
}
