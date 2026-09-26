import { ipcMain } from 'electron';
import { testGeminiApiKey, setGeminiApiKey } from '../services/gemini/client';
import { tagStickerItem } from '../services/gemini/tagger-service';

export function registerGeminiIpcHandlers(): void {
  ipcMain.handle('gemini:tagItem', async (_event, itemId: string) => {
    try {
      return await tagStickerItem(itemId);
    } catch (err: any) {
      console.error('IPC gemini:tagItem error:', err);
      return false;
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
