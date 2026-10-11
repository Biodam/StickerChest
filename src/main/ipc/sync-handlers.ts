import { ipcMain } from 'electron';
import { getSyncManager } from '../services/sync/sync-manager';
import { loadSettings } from '../services/settings/settings-store';
import { exportMetadata } from '../services/sync/metadata-sync';

export function registerSyncIpcHandlers(): void {
  ipcMain.handle('sync:triggerSync', async () => getSyncManager().syncNow());

  ipcMain.handle('sync:validate', async (_, folderUrl: string, apiKey: string) =>
    getSyncManager().validate(folderUrl, apiKey)
  );

  ipcMain.handle('sync:exportMetadata', async () => {
    const folder = loadSettings().sourceFolder;
    if (!folder) return { success: false, error: 'Choose a local sticker folder first.' };
    try {
      const res = exportMetadata(folder);
      return { success: true, path: res.path, count: res.count };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
}
