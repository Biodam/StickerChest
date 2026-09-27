import fs from 'fs';
import path from 'path';
import { calculateFileSha256 } from '../imaging/hasher';
import { detectImageInfo } from '../imaging/format-detector';
import { generateStickerVariant, generateEmojiVariant, generateThumbnailVariant } from '../imaging/resizer';
import { ensureVaultDirectories, getVariantOutputPath, getRelativePath } from './paths';
import { StickerDatabaseDAL, getDatabaseDAL } from '../database/dal';
import { waitUntilFileStable } from './cloud-sync-helper';
import { tagStickerItem } from '../gemini/tagger-service';
import { getGeminiApiKey } from '../gemini/client';
import { parseTagsFromFilename } from './filename-tagger';

export interface IngestFileResult {
  itemId: string;
  isNew: boolean;
  sha256Hash: string;
}

export async function ingestImageFile(
  filePath: string,
  dal: StickerDatabaseDAL = getDatabaseDAL(),
  forceReprocess = false,
  autoTagAi = true
): Promise<IngestFileResult> {
  ensureVaultDirectories();

  // 1. Wait until cloud/local file is completely written and unlocked
  const isStable = await waitUntilFileStable(filePath, 4000);
  if (!isStable) {
    throw new Error(`File is locked or incompletely synced: ${filePath}`);
  }

  // 2. Calculate file SHA-256 for deduplication
  const hash = await calculateFileSha256(filePath);

  // 3. Check existing record
  const existing = dal.getItemByHash(hash);
  if (existing && !forceReprocess) {
    const hasAllVariants =
      existing.variants.sticker && existing.variants.emoji && existing.variants.thumb;
    if (hasAllVariants) {
      return { itemId: existing.id, isNew: false, sha256Hash: hash };
    }
  }

  // 4. Detect format and metadata
  const stats = await fs.promises.stat(filePath);
  const info = await detectImageInfo(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);

  // 5. Upsert item in database with relative path for cross-platform sync
  const relativeOriginal = getRelativePath(filePath);
  const itemId = dal.upsertItem({
    id: existing?.id,
    sha256Hash: hash,
    filename,
    originalPath: relativeOriginal,
    ext,
    mimeType: info.mimeType,
    width: info.width,
    height: info.height,
    fileSizeBytes: stats.size,
    isAnimated: info.isAnimated,
    frameCount: info.frameCount,
  });

  // 6. Generate variants in parallel
  const stickerPath = getVariantOutputPath(hash, 'sticker', '.webp');
  const emojiPath = getVariantOutputPath(hash, 'emoji', '.webp');
  const thumbPath = getVariantOutputPath(hash, 'thumb', '.webp');

  const [stickerRes, emojiRes, thumbRes] = await Promise.all([
    generateStickerVariant(filePath, stickerPath, info.isAnimated),
    generateEmojiVariant(filePath, emojiPath, info.isAnimated),
    generateThumbnailVariant(filePath, thumbPath, info.isAnimated),
  ]);

  // 7. Save variants in database with relative paths
  dal.upsertVariant({
    itemId,
    tier: 'sticker',
    filePath: getRelativePath(stickerRes.filePath),
    format: stickerRes.format,
    width: stickerRes.width,
    height: stickerRes.height,
    fileSizeBytes: stickerRes.fileSizeBytes,
  });

  dal.upsertVariant({
    itemId,
    tier: 'emoji',
    filePath: getRelativePath(emojiRes.filePath),
    format: emojiRes.format,
    width: emojiRes.width,
    height: emojiRes.height,
    fileSizeBytes: emojiRes.fileSizeBytes,
  });

  dal.upsertVariant({
    itemId,
    tier: 'thumb',
    filePath: getRelativePath(thumbRes.filePath),
    format: thumbRes.format,
    width: thumbRes.width,
    height: thumbRes.height,
    fileSizeBytes: thumbRes.fileSizeBytes,
  });

  // 8. If new item or existing untagged item, tag with AI if key available
  const needsAiTag = !existing || existing.metadata?.aiStatus !== 'completed';
  if (needsAiTag && autoTagAi && getGeminiApiKey()) {
    tagStickerItem(itemId, dal).catch((aiErr) => {
      console.warn(`Background auto-tagging error for ${itemId}:`, aiErr);
    });
  } else if (!existing) {
    const filenameTags = parseTagsFromFilename(filename);
    const fallbackTags = filenameTags.length > 0
      ? filenameTags
      : [path.parse(filename).name.replace(/[-_]/g, ' ').toLowerCase()];

    dal.saveMetadata({
      itemId,
      character: null,
      sourceOrigin: null,
      action: null,
      feeling: null,
      description: null,
      tags: fallbackTags,
      aiStatus: 'manual_only',
    });
  }

  return { itemId, isNew: !existing, sha256Hash: hash };
}
