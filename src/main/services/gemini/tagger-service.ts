import fs from 'fs';
import { getGeminiQueue } from './queue';
import { StickerDatabaseDAL, getDatabaseDAL } from '../database/dal';
import { getGeminiApiKey } from './client';

export async function tagStickerItem(
  itemId: string,
  dal: StickerDatabaseDAL = getDatabaseDAL()
): Promise<boolean> {
  const item = dal.getItemById(itemId);
  if (!item) {
    throw new Error(`Item ${itemId} not found in database`);
  }

  // Determine which image file to upload to Gemini (prefer sticker 512px variant to save bandwidth/tokens)
  const imagePath =
    item.variants.sticker?.filePath ||
    item.variants.thumb?.filePath ||
    item.originalPath;

  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image file does not exist: ${imagePath}`);
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    // If no key configured, mark as manual_only
    dal.saveMetadata({
      itemId,
      aiStatus: 'manual_only',
      aiError: 'Gemini API key is not configured in Settings',
    });
    return false;
  }

  // Update status to processing
  dal.saveMetadata({
    itemId,
    aiStatus: 'processing',
  });

  try {
    const buffer = await fs.promises.readFile(imagePath);
    const mimeType = imagePath.endsWith('.webp') ? 'image/webp' : item.mimeType;

    const queue = getGeminiQueue();
    const result = await queue.enqueue(itemId, buffer, mimeType);

    // Save extracted metadata into SQLite
    dal.saveMetadata({
      itemId,
      character: result.character,
      sourceOrigin: result.source,
      action: result.action,
      feeling: result.feeling,
      description: result.description,
      aiModel: 'gemini-2.5-flash',
      aiStatus: 'completed',
      tags: result.tags,
      rawAiJson: JSON.stringify(result),
    });

    return true;
  } catch (err: any) {
    console.error(`AI tagging failed for item ${itemId}:`, err);
    dal.saveMetadata({
      itemId,
      aiStatus: 'failed',
      aiError: err?.message || 'Gemini tagging error',
    });
    return false;
  }
}
