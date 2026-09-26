import type { Database } from 'better-sqlite3';
import { LibraryFacets, FilterFacet } from '../../../types/models';

export function getLibraryFacets(db: Database): LibraryFacets {
  // Query franchises (sourceOrigin) ordered by count descending
  const franchises = db
    .prepare(`
      SELECT source_origin as name, COUNT(DISTINCT item_id) as count
      FROM metadata
      WHERE source_origin IS NOT NULL AND TRIM(source_origin) != ''
      GROUP BY source_origin
      ORDER BY count DESC, name COLLATE NOCASE ASC
      LIMIT 50
    `)
    .all() as FilterFacet[];

  // Query characters ordered by count descending
  const characters = db
    .prepare(`
      SELECT character as name, COUNT(DISTINCT item_id) as count
      FROM metadata
      WHERE character IS NOT NULL AND TRIM(character) != ''
      GROUP BY character
      ORDER BY count DESC, name COLLATE NOCASE ASC
      LIMIT 50
    `)
    .all() as FilterFacet[];

  // Query tags ordered by count descending
  const tags = db
    .prepare(`
      SELECT t.name as name, COUNT(DISTINCT it.item_id) as count
      FROM tags t
      JOIN item_tags it ON it.tag_id = t.id
      GROUP BY t.id, t.name
      ORDER BY count DESC, t.name COLLATE NOCASE ASC
      LIMIT 50
    `)
    .all() as FilterFacet[];

  return { franchises, characters, tags };
}
