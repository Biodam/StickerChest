import { clipboard, nativeImage } from 'electron';
import fs from 'fs';
import { getDatabaseDAL } from '../database/dal';
import { ImageTier } from '../../../types/models';

export async function copyStickerToClipboard(
  itemId: string,
  preferredTier: ImageTier = 'sticker'
): Promise<boolean> {
  const dal = getDatabaseDAL();
  const item = dal.getItemById(itemId);
  if (!item) {
    console.error(`Item ${itemId} not found`);
    return false;
  }

  // Select appropriate variant file path
  let targetPath = item.originalPath;
  if (preferredTier === 'emoji' && item.variants.emoji?.filePath) {
    targetPath = item.variants.emoji.filePath;
  } else if (preferredTier === 'sticker' && item.variants.sticker?.filePath) {
    targetPath = item.variants.sticker.filePath;
  } else if (item.variants.sticker?.filePath) {
    targetPath = item.variants.sticker.filePath;
  }

  if (!fs.existsSync(targetPath)) {
    console.error(`Target image file does not exist: ${targetPath}`);
    return false;
  }

  try {
    const buffer = fs.readFileSync(targetPath);
    const mimeType = targetPath.endsWith('.png')
      ? 'image/png'
      : targetPath.endsWith('.gif')
      ? 'image/gif'
      : 'image/webp';

    // Support both modern Electron 44 ClipboardItem API and nativeImage writeImage
    if (typeof (clipboard as any).writeImage === 'function') {
      const img = nativeImage.createFromBuffer(buffer);
      (clipboard as any).writeImage(img);
    } else if (typeof (clipboard as any).write === 'function') {
      const blob = new Blob([buffer], { type: mimeType });
      const ClipboardItemConstructor = (globalThis as any).ClipboardItem || (clipboard as any).ClipboardItem;
      if (ClipboardItemConstructor) {
        const clipItem = new ClipboardItemConstructor({ [mimeType]: blob });
        await (clipboard as any).write([clipItem]);
      }
    }

    // Increment copy count and update last_copied_at
    dal.recordItemUsage(itemId);
    return true;
  } catch (err) {
    console.error('Failed to write image to system clipboard:', err);
    return false;
  }
}
