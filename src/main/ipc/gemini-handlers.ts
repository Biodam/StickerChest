import { ipcMain, BrowserWindow } from 'electron';
import { testGeminiApiKey, setGeminiApiKey } from '../services/gemini/client';
import { tagStickerItem, batchTagUntaggedItems } from '../services/gemini/tagger-service';
import { getDatabaseDAL } from '../services/database/dal';

export function registerGeminiIpcHandlers(): void {
  ipcMain.handle('gemini:tagItem', async (_event, itemId: string) => {
    try {
      return await tagStickerItem(itemId);
    } catch (err: any) {
      console.error('IPC gemini:tagItem error:', err);
      return false;
    }
  });

  ipcMain.handle('gemini:batchTag', async () => {
    const dal = getDatabaseDAL();
    const untagged = dal.getUntaggedItems();
    if (untagged.length === 0) {
      return { started: false, total: 0 };
    }

    const broadcast = (event: any) => {
      for (const win of BrowserWindow.getAllWindows()) {
        if (!win.isDestroyed()) win.webContents.send('vault:progress', event);
      }
    };

    (async () => {
      try {
        await batchTagUntaggedItems((prog) => {
          broadcast({
            status: 'tagging',
            currentFile: prog.filename,
            processedCount: prog.processed,
            totalCount: prog.total,
          });
        }, dal);

        broadcast({
          status: 'idle',
          processedCount: untagged.length,
          totalCount: untagged.length,
        });
      } catch (err: any) {
        broadcast({
          status: 'error',
          error: err.message,
          processedCount: 0,
          totalCount: untagged.length,
        });
      }
    })();

    return { started: true, total: untagged.length };
  });

  ipcMain.handle('gemini:getUntaggedCount', async () => {
    try {
      return getDatabaseDAL().getUntaggedItems().length;
    } catch {
      return 0;
    }
  });

  ipcMain.handle('gemini:testKey', async (_event, apiKey: string, model?: string) => {
    try {
      const result = await testGeminiApiKey(apiKey, model);
      if (result.valid) {
        setGeminiApiKey(apiKey);
      }
      return result;
    } catch (err: any) {
      return { valid: false, message: err?.message || 'Error validating key' };
    }
  });
}
