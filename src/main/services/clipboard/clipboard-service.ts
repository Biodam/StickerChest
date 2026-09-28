import { clipboard, nativeImage } from 'electron';
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

    // Standardize to PNG buffer for universal cross-application OS clipboard compatibility
    let pngBuffer: Buffer;
    if (ext.endsWith('.png')) {
      pngBuffer = buffer;
    } else {
      pngBuffer = await sharp(buffer).png().toBuffer();
    }

    let written = false;

    // 1. Try modern Electron 44+ Async ClipboardItem API
    try {
      const electronModule = await import('electron');
      const ItemClass = (electronModule as any).ClipboardItem || (globalThis as any).ClipboardItem;
      if (ItemClass && typeof clipboard.write === 'function') {
        const formats: Record<string, Blob> = {
          'image/png': new Blob([new Uint8Array(pngBuffer)], { type: 'image/png' }),
        };
        if (ext.endsWith('.gif')) {
          formats['image/gif'] = new Blob([new Uint8Array(buffer)], { type: 'image/gif' });
        }
        const clipItem = new ItemClass(formats);
        await clipboard.write([clipItem]);
        written = true;
      }
    } catch (modernErr) {
      console.warn('[ClipboardService] Modern clipboard.write fallback needed:', modernErr);
    }

    // 2. Fallback to nativeImage writeImage or writeBuffer
    if (!written) {
      if (typeof (clipboard as any).writeImage === 'function' && typeof nativeImage?.createFromBuffer === 'function') {
        const img = nativeImage.createFromBuffer(pngBuffer);
        (clipboard as any).writeImage(img);
        written = true;
      } else if (typeof (clipboard as any).writeBuffer === 'function') {
        (clipboard as any).writeBuffer('image/png', pngBuffer);
        written = true;
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
  // Ensure picker window hides immediately so OS focus returns to previously active window
  try {
    hidePickerWindow();
  } catch (err) {
    console.warn('[ClipboardService] Could not hide picker window:', err);
  }

  const copied = await copyStickerToClipboard(itemId, preferredTier);
  if (!copied) return false;

  const settings = loadSettings();
  if (settings.autoPasteOnSelect !== false) {
    // 150ms settling delay allows Windows/macOS to restore focus to target app before keystroke
    await new Promise((resolve) => setTimeout(resolve, 150));
    await simulatePasteKeystroke();
  }

  return true;
}


