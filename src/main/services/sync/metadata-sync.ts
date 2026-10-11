import fs from 'fs';
import path from 'path';
import { getDatabaseDAL, StickerDatabaseDAL } from '../database/dal';
import { METADATA_FILENAME } from './sync-diff';

export interface MetadataEntry {
  sha256Hash: string;
  character?: string | null;
  sourceOrigin?: string | null;
  action?: string | null;
  feeling?: string | null;
  description?: string | null;
  tags?: string[];
  customAttributes?: Record<string, string>;
  isFavorite?: boolean;
}

export interface MetadataFile {
  version: 1;
  exportedAt: string;
  items: MetadataEntry[];
}

export function buildMetadataFile(dal: StickerDatabaseDAL): MetadataFile {
  const { items } = dal.searchItems({ limit: 1000000 });
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    items: items.map((item) => ({
      sha256Hash: item.sha256Hash,
      character: item.metadata?.character ?? null,
      sourceOrigin: item.metadata?.sourceOrigin ?? null,
      action: item.metadata?.action ?? null,
      feeling: item.metadata?.feeling ?? null,
      description: item.metadata?.description ?? null,
      tags: [...new Set([...(item.tags || []), ...(item.userTags || [])])],
      customAttributes: item.customAttributes || {},
      isFavorite: item.usage?.isFavorite ?? false,
    })),
  };
}

/** Writes the metadata JSON into the source folder (ready to be uploaded to Drive manually). */
export function exportMetadata(folder: string, dal: StickerDatabaseDAL = getDatabaseDAL()): { path: string; count: number } {
  const file = buildMetadataFile(dal);
  const outPath = path.join(folder, METADATA_FILENAME);
  fs.writeFileSync(outPath, JSON.stringify(file, null, 2), 'utf-8');
  return { path: outPath, count: file.items.length };
}

/** Applies metadata to items already ingested (matched by SHA-256). Returns number applied. */
export function importMetadata(folder: string, dal: StickerDatabaseDAL = getDatabaseDAL()): number {
  const filePath = path.join(folder, METADATA_FILENAME);
  if (!fs.existsSync(filePath)) return 0;

  let parsed: MetadataFile;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error('Invalid metadata JSON:', err);
    return 0;
  }
  if (!parsed || !Array.isArray(parsed.items)) return 0;

  let applied = 0;
  for (const entry of parsed.items) {
    try {
      const item = entry?.sha256Hash ? dal.getItemByHash(entry.sha256Hash) : null;
      if (!item) continue;
      // Never clobber metadata the user has already edited locally.
      if (item.metadata?.isUserEdited) continue;

      dal.saveMetadata({
        itemId: item.id,
        character: entry.character ?? null,
        sourceOrigin: entry.sourceOrigin ?? null,
        action: entry.action ?? null,
        feeling: entry.feeling ?? null,
        description: entry.description ?? null,
        aiStatus: 'manual_only',
        tags: entry.tags,
        customAttributes: entry.customAttributes,
      });
      if (entry.isFavorite && !item.usage?.isFavorite) dal.toggleFavorite(item.id, true);
      applied++;
    } catch (err) {
      console.error('Failed to import metadata entry:', err);
    }
  }
  return applied;
}
