import * as electron from 'electron';
import fs from 'fs';
import sharp from 'sharp';
import { getDatabaseDAL } from '../database/dal';
import { ImageTier } from '../../../types/models';
import { hidePickerWindow } from '../../windows/pickerWindow';
import { loadSettings } from '../settings/settings-store';
import { simulatePasteKeystroke } from './paste-simulator';
import { logger } from '../logger/logger';

export async function copyStickerToClipboard(
  itemId: string,
  preferredTier: ImageTier = 'sticker'
): Promise<boolean> {
  const startTime = Date.now();
  logger.info('Clipboard', `Starting copy for item ${itemId} (preferred tier: ${preferredTier})`);

  const dal = getDatabaseDAL();
  const item = dal.getItemById(itemId);
  if (!item) {
    logger.error('Clipboard', `Item ${itemId} not found in database`);
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

  logger.info('Clipboard', `Resolved target file path: ${targetPath}`);

  if (!fs.existsSync(targetPath)) {
    logger.error('Clipboard', `Target image file does not exist on disk: ${targetPath}`);
    return false;
  }

  try {
    const rawBuffer = fs.readFileSync(targetPath);
    const ext = targetPath.toLowerCase();
    const isGif = item.isAnimated || ext.endsWith('.gif');
    logger.info('Clipboard', `Read ${rawBuffer.length} bytes from disk (isGif=${isGif})`);

    // Prepare a clean PNG buffer
    let pngBuffer: Buffer;
    if (ext.endsWith('.png')) {
      pngBuffer = rawBuffer;
    } else {
      pngBuffer = await sharp(rawBuffer).png().toBuffer();
    }
    logger.info('Clipboard', `Prepared PNG fallback buffer (${pngBuffer.length} bytes)`);

    const title = item.metadata?.character || item.metadata?.feeling || item.filename;
    const fileUrl = `file:///${targetPath.replace(/\\/g, '/')}`;
    const htmlSnippet = `<img src="${fileUrl}" alt="${item.filename}" />`;

    // Multi-format clipboard payload
    const formats: Record<string, Blob> = {
      'image/png': new Blob([new Uint8Array(pngBuffer)], { type: 'image/png' }),
      'text/plain': new Blob([new Uint8Array(Buffer.from(title))], { type: 'text/plain' }),
      'text/html': new Blob([new Uint8Array(Buffer.from(htmlSnippet))], { type: 'text/html' }),
    };

    if (isGif) {
      formats['image/gif'] = new Blob([new Uint8Array(rawBuffer)], { type: 'image/gif' });
    }

    const ClipboardItemClass =
      (electron as any).ClipboardItem ||
      (electron as any).default?.ClipboardItem ||
      (globalThis as any).ClipboardItem;

    if (!ClipboardItemClass) {
      logger.error('Clipboard', 'ClipboardItem constructor not found on Electron or globalThis');
      return false;
    }

    const clipItem = new ClipboardItemClass(formats);
    const clipboardApi = electron.clipboard || (electron as any).default?.clipboard;
    await clipboardApi.write([clipItem]);

    const elapsed = Date.now() - startTime;
    logger.info('Clipboard', `Successfully wrote to system clipboard in ${elapsed}ms`, {
      itemId,
      filename: item.filename,
      isGif,
      formats: Object.keys(formats),
      title,
    });

    dal.recordItemUsage(itemId);
    return true;
  } catch (err: any) {
    logger.error('Clipboard', `Failed to copy sticker to system clipboard: ${err.message}`, err);
    return false;
  }
}

export async function copyAndPasteSticker(
  itemId: string,
  preferredTier: ImageTier = 'sticker'
): Promise<boolean> {
  logger.info('AutoPaste', `Initiating copyAndPasteSticker for itemId=${itemId}, tier=${preferredTier}`);

  const dal = getDatabaseDAL();
  const item = dal.getItemById(itemId);

  let targetPath: string | undefined;
  let title: string | undefined;
  if (item) {
    targetPath = item.originalPath;
    if (preferredTier === 'emoji' && item.variants.emoji?.filePath) {
      targetPath = item.variants.emoji.filePath;
    } else if (item.variants.sticker?.filePath) {
      targetPath = item.variants.sticker.filePath;
    }
    title = item.metadata?.character || item.metadata?.feeling || item.filename;
  }

  const copied = await copyStickerToClipboard(itemId, preferredTier);
  if (!copied) {
    logger.warn('AutoPaste', `Copy failed for itemId=${itemId}; aborting paste simulation`);
    return false;
  }

  // Dismiss Quick Picker window so previously active window regains OS focus
  try {
    logger.info('AutoPaste', 'Hiding Quick Picker window...');
    hidePickerWindow();
  } catch (err: any) {
    logger.warn('AutoPaste', `Could not hide picker window: ${err.message}`);
  }

  const settings = loadSettings();
  if (settings.autoPasteOnSelect !== false) {
    logger.info('AutoPaste', 'Settling delay: waiting 150ms for OS foreground window focus restoration...');
    await new Promise((resolve) => setTimeout(resolve, 150));

    logger.info('AutoPaste', 'Triggering paste keystroke simulation with native helper fallback...', { targetPath, title });
    const pasted = await simulatePasteKeystroke({ filePath: targetPath, text: title });
    logger.info('AutoPaste', `Paste simulation completed. Result: ${pasted}`);
  } else {
    logger.info('AutoPaste', 'autoPasteOnSelect is disabled in settings; skipping paste keystroke simulation');
  }

  return true;
}
