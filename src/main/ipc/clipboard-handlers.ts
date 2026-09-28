import { ipcMain } from 'electron';
import { copyStickerToClipboard, copyAndPasteSticker } from '../services/clipboard/clipboard-service';
import { ImageTier } from '../../types/models';
import { logger } from '../services/logger/logger';

export function registerClipboardIpcHandlers(): void {
  ipcMain.handle('clipboard:copyItem', async (_event, itemId: string, tier?: ImageTier) => {
    logger.info('ClipboardIPC', `IPC handle clipboard:copyItem invoked for ${itemId}, tier: ${tier}`);
    try {
      return await copyStickerToClipboard(itemId, tier || 'sticker');
    } catch (err: any) {
      logger.error('ClipboardIPC', `IPC clipboard:copyItem error: ${err.message}`, err);
      return false;
    }
  });

  ipcMain.handle('clipboard:copyAndPasteItem', async (_event, itemId: string, tier?: ImageTier) => {
    logger.info('ClipboardIPC', `IPC handle clipboard:copyAndPasteItem invoked for ${itemId}, tier: ${tier}`);
    try {
      return await copyAndPasteSticker(itemId, tier || 'sticker');
    } catch (err: any) {
      logger.error('ClipboardIPC', `IPC clipboard:copyAndPasteItem error: ${err.message}`, err);
      return false;
    }
  });
}
