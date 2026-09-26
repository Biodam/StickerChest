import fs from 'fs';
import path from 'path';
import { calculateFileSha256 } from '../imaging/hasher';
import { detectImageInfo } from '../imaging/format-detector';
import { generateStickerVariant, generateEmojiVariant, generateThumbnailVariant } from '../imaging/resizer';
import { ensureVaultDirectories, getVariantOutputPath } from './paths';
import { StickerDatabaseDAL, getDatabaseDAL } from '../database/dal';

export interface IngestFileResult {
  itemId: string;
  isNew: boolean;
  sha256Hash: string;
}

export async function ingestImageFile(
  filePath: string,
  dal: StickerDatabaseDAL = getDatabaseDAL(),
  forceReprocess = false
): Promise<IngestFileResult> {
  ensureVaultDirectories();

  // 1. Calculate file SHA-256 for deduplication
  const hash = await calculateFileSha256(filePath);

  // 2. Check existing record
  const existing = dal.getItemByHash(hash);
  if (existing && !forceReprocess) {
    const hasAllVariants =
      existing.variants.sticker && existing.variants.emoji && existing.variants.thumb;
    if (hasAllVariants) {
      return { itemId: existing.id, isNew: false, sha256Hash: hash };
    }
  }

  // 3. Detect format and metadata
  const stats = await fs.promises.stat(filePath);
  const info = await detectImageInfo(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);

  // 4. Upsert item in database
  const itemId = dal.upsertItem({
    id: existing?.id,
    sha256Hash: hash,
    filename,
    originalPath: filePath,
    ext,
    mimeType: info.mimeType,
    width: info.width,
    height: info.height,
    fileSizeBytes: stats.size,
    isAnimated: info.isAnimated,
    frameCount: info.frameCount,
  });

  // 5. Generate variants in parallel
  const stickerPath = getVariantOutputPath(hash, 'sticker', '.webp');
  const emojiPath = getVariantOutputPath(hash, 'emoji', '.webp');
  const thumbPath = getVariantOutputPath(hash, 'thumb', '.webp');

  const [stickerRes, emojiRes, thumbRes] = await Promise.all([
    generateStickerVariant(filePath, stickerPath, info.isAnimated),
    generateEmojiVariant(filePath, emojiPath, info.isAnimated),
    generateThumbnailVariant(filePath, thumbPath, info.isAnimated),
  ]);

  // 6. Save variants in database
  dal.upsertVariant({
    itemId,
    tier: 'sticker',
    filePath: stickerRes.filePath,
    format: stickerRes.format,
    width: stickerRes.width,
    height: stickerRes.height,
    fileSizeBytes: stickerRes.fileSizeBytes,
  });

  dal.upsertVariant({
    itemId,
    tier: 'emoji',
    filePath: emojiRes.filePath,
    format: emojiRes.format,
    width: emojiRes.width,
    height: emojiRes.height,
    fileSizeBytes: emojiRes.fileSizeBytes,
  });

  dal.upsertVariant({
    itemId,
    tier: 'thumb',
    filePath: thumbRes.filePath,
    format: thumbRes.format,
    width: thumbRes.width,
    height: thumbRes.height,
    fileSizeBytes: thumbRes.fileSizeBytes,
  });

  return { itemId, isNew: !existing, sha256Hash: hash };
}
