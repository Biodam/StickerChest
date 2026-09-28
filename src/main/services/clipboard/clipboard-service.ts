import { clipboard, ClipboardItem, nativeImage } from 'electron';
import fs from 'fs';
import sharp from 'sharp';
import { getDatabaseDAL } from '../database/dal';
import { ImageTier } from '../../../types/models';
import { hidePickerWindow } from '../../windows/pickerWindow';
import { loadSettings } from '../settings/settings-store';
import { simulatePasteKeystroke } from './paste-simulator';

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
    const ext = targetPath.toLowerCase();

    // Universal OS clipboard compatibility: Always prepare a clean PNG image buffer
    let pngBuffer: Buffer;
    if (ext.endsWith('.png')) {
      pngBuffer = buffer;
    } else {
      pngBuffer = await sharp(buffer).png().toBuffer();
    }

    const title = item.metadata?.character || item.filename;
    const formats: Record<string, Blob> = {
      'image/png': new Blob([new Uint8Array(pngBuffer)], { type: 'image/png' }),
      'text/plain': new Blob([new Uint8Array(Buffer.from(title))], { type: 'text/plain' }),
    };

    if (ext.endsWith('.gif')) {
      formats['image/gif'] = new Blob([new Uint8Array(buffer)], { type: 'image/gif' });
    }

    try {
      const ItemClass = ClipboardItem || (globalThis as any).ClipboardItem;
      const clipItem = new ItemClass(formats);
      await clipboard.write([clipItem]);
    } catch (writeErr) {
      console.warn('[ClipboardService] ClipboardItem write failed, trying fallback:', writeErr);
      if (typeof (clipboard as any).writeImage === 'function' && typeof nativeImage?.createFromBuffer === 'function') {
        const img = nativeImage.createFromBuffer(pngBuffer);
        (clipboard as any).writeImage(img);
      }
    }

    dal.recordItemUsage(itemId);
    return true;
  } catch (err) {
    console.error('Failed to write image to system clipboard:', err);
    return false;
  }
}

export async function copyAndPasteSticker(
  itemId: string,
  preferredTier: ImageTier = 'sticker'
): Promise<boolean> {
  const copied = await copyStickerToClipboard(itemId, preferredTier);
  if (!copied) return false;

  // Dismiss Quick Picker window so the previously active window regains OS focus
  try {
    hidePickerWindow();
  } catch (err) {
    console.warn('[ClipboardService] Could not hide picker window:', err);
  }

  const settings = loadSettings();
  if (settings.autoPasteOnSelect !== false) {
    // 200ms settling delay allows Windows/macOS to restore foreground focus before virtual Ctrl+V
    await new Promise((resolve) => setTimeout(resolve, 200));
    await simulatePasteKeystroke();
  }

  return true;
}


