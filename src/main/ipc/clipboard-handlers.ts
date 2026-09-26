import { ipcMain } from 'electron';
import { copyStickerToClipboard } from '../services/clipboard/clipboard-service';
import { ImageTier } from '../../types/models';

export function registerClipboardIpcHandlers(): void {
  ipcMain.handle('clipboard:copyItem', async (_event, itemId: string, tier?: ImageTier) => {
    try {
      return await copyStickerToClipboard(itemId, tier || 'sticker');
    } catch (err: any) {
      console.error('IPC clipboard:copyItem error:', err);
      return false;
    }
  });
}
