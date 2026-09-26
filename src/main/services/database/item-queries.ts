import type { Database } from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { StickerItem, StickerVariant, StickerMetadata, ImageTier } from '../../../types/models';
import { ItemInsertInput, VariantInsertInput, ItemRow, VariantRow, MetadataRow, UsageRow } from './types';
import { resolveVaultPath } from '../ingestion/paths';

export function upsertItem(db: Database, input: ItemInsertInput): string {
  const id = input.id || randomUUID();
  const stmt = db.prepare(`
    INSERT INTO items (
      id, sha256_hash, filename, original_path, ext, mime_type,
      width, height, file_size_bytes, is_animated, frame_count, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP
    ) ON CONFLICT(sha256_hash) DO UPDATE SET
      filename = excluded.filename,
      original_path = excluded.original_path,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id
  `);

  const row = stmt.get(
    id,
    input.sha256Hash,
    input.filename,
    input.originalPath,
    input.ext,
    input.mimeType,
    input.width,
    input.height,
    input.fileSizeBytes,
    input.isAnimated ? 1 : 0,
    input.frameCount ?? 1
  ) as { id: string };

  // Ensure default usage_stats record exists
  db.prepare(`INSERT OR IGNORE INTO usage_stats (item_id) VALUES (?)`).run(row.id);

  return row.id;
}

export function upsertVariant(db: Database, input: VariantInsertInput): string {
  const id = input.id || randomUUID();
  const stmt = db.prepare(`
    INSERT INTO variants (id, item_id, tier, file_path, format, width, height, file_size_bytes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(item_id, tier) DO UPDATE SET
      file_path = excluded.file_path,
      format = excluded.format,
      width = excluded.width,
      height = excluded.height,
      file_size_bytes = excluded.file_size_bytes
    RETURNING id
  `);

  const row = stmt.get(
    id,
    input.itemId,
    input.tier,
    input.filePath,
    input.format,
    input.width,
    input.height,
    input.fileSizeBytes
  ) as { id: string };

  return row.id;
}

export function getItemById(db: Database, id: string): StickerItem | null {
  const itemRow = db.prepare(`SELECT * FROM items WHERE id = ?`).get(id) as ItemRow | undefined;
  if (!itemRow) return null;
  return hydrateItem(db, itemRow);
}

export function getItemByHash(db: Database, hash: string): StickerItem | null {
  const itemRow = db.prepare(`SELECT * FROM items WHERE sha256_hash = ?`).get(hash) as ItemRow | undefined;
  if (!itemRow) return null;
  return hydrateItem(db, itemRow);
}

export function deleteItem(db: Database, id: string): boolean {
  const result = db.prepare(`DELETE FROM items WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function hydrateItem(db: Database, row: ItemRow): StickerItem {
  const variantsRows = db.prepare(`SELECT * FROM variants WHERE item_id = ?`).all(row.id) as VariantRow[];
  const metaRow = db.prepare(`SELECT * FROM metadata WHERE item_id = ?`).get(row.id) as MetadataRow | undefined;
  const usageRow = db.prepare(`SELECT * FROM usage_stats WHERE item_id = ?`).get(row.id) as UsageRow | undefined;

  const tagRows = db.prepare(`
    SELECT t.name, it.is_ai_generated FROM tags t
    JOIN item_tags it ON it.tag_id = t.id
    WHERE it.item_id = ?
    ORDER BY it.rowid ASC
  `).all(row.id) as { name: string; is_ai_generated: number }[];

  const customRows = db.prepare(`
    SELECT attribute_key, attribute_value FROM custom_attributes WHERE item_id = ?
  `).all(row.id) as { attribute_key: string; attribute_value: string }[];

  const variantsMap: Record<ImageTier, StickerVariant | null> = {
    raw: null,
    sticker: null,
    emoji: null,
    thumb: null,
  };

  for (const v of variantsRows) {
    variantsMap[v.tier] = {
      id: v.id,
      itemId: v.item_id,
      tier: v.tier,
      filePath: resolveVaultPath(v.file_path),
      format: v.format,
      width: v.width,
      height: v.height,
      fileSizeBytes: v.file_size_bytes,
      createdAt: v.created_at,
    };
  }

  const customAttributes: Record<string, string> = {};
  for (const c of customRows) {
    customAttributes[c.attribute_key] = c.attribute_value;
  }

  let userLockedFields: string[] = [];
  try {
    if (metaRow?.user_locked_fields) {
      userLockedFields = JSON.parse(metaRow.user_locked_fields);
    }
  } catch {}

  const metadata: StickerMetadata | null = metaRow ? {
    id: metaRow.id,
    itemId: metaRow.item_id,
    character: metaRow.character,
    sourceOrigin: metaRow.source_origin,
    action: metaRow.action,
    feeling: metaRow.feeling,
    description: metaRow.description,
    aiModel: metaRow.ai_model,
    aiStatus: metaRow.ai_status,
    aiError: metaRow.ai_error,
    userLockedFields,
    isUserEdited: (metaRow.is_user_edited ?? 0) === 1,
    createdAt: metaRow.created_at,
    updatedAt: metaRow.updated_at,
  } : null;

  return {
    id: row.id,
    sha256Hash: row.sha256_hash,
    filename: row.filename,
    originalPath: resolveVaultPath(row.original_path),
    ext: row.ext,
    mimeType: row.mime_type,
    width: row.width,
    height: row.height,
    fileSizeBytes: row.file_size_bytes,
    isAnimated: row.is_animated === 1,
    frameCount: row.frame_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    variants: variantsMap,
    metadata,
    tags: tagRows.map((t) => t.name),
    userTags: tagRows.filter((t) => t.is_ai_generated === 0).map((t) => t.name),
    customAttributes,
    usage: {
      itemId: row.id,
      isFavorite: (usageRow?.is_favorite ?? 0) === 1,
      copyCount: usageRow?.copy_count ?? 0,
      lastCopiedAt: usageRow?.last_copied_at ?? null,
    },
  };
}
