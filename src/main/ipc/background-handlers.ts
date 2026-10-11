import { ipcMain, app } from 'electron';
import { getDatabaseDAL } from '../services/database/dal';
import { ingestImageFile } from '../services/ingestion/coordinator';
import { removeImageBackground, getDefaultWorkerPath } from '../services/imaging/background-remover';
import { BackgroundRemovalResult } from '../../types/models';

export function registerBackgroundIpcHandlers(): void {
  ipcMain.handle('image:removeBackground', async (_event, itemIds: string[]): Promise<BackgroundRemovalResult[]> => {
    const dal = getDatabaseDAL();
    const workerPath = getDefaultWorkerPath(app.getAppPath());
    const results: BackgroundRemovalResult[] = [];

    for (const itemId of itemIds) {
      try {
        const item = dal.getItemById(itemId);
        if (!item) throw new Error('Sticker not found');
        if (item.isAnimated) throw new Error('Animated stickers are not supported');

        const outPath = await removeImageBackground(item.originalPath, workerPath);
        const ingested = await ingestImageFile(outPath, dal, false, false);

        // Carry the original's tags over to the transparent copy.
        const tags = [...new Set([...(item.tags || []), ...(item.userTags || [])])];
        if (tags.length > 0) dal.setTags(ingested.itemId, tags, false);

        results.push({ itemId, success: true, newItemId: ingested.itemId, outputPath: outPath });
      } catch (err: any) {
        console.error(`IPC image:removeBackground error for ${itemId}:`, err);
        results.push({ itemId, success: false, error: err.message });
      }
    }
    return results;
  });
}
