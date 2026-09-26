import { ipcMain, BrowserWindow } from 'electron';
import { getIngestionService } from '../services/ingestion/folder-watcher';
import { getDatabaseDAL } from '../services/database/dal';

export function registerVaultIpcHandlers(): void {
  const ingestionService = getIngestionService();

  // Forward ingestion progress events to all open windows
  ingestionService.addProgressListener((event) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send('vault:progress', event);
      }
    }
  });

  ipcMain.handle('vault:scan', async (_event, folderPath?: string, forceReprocess?: boolean) => {
    if (!folderPath) {
      return { started: false, error: 'No folder path provided' };
    }

    // Launch scan asynchronously so IPC returns immediately
    ingestionService.scanFolder(folderPath, forceReprocess).catch((err) => {
      console.error('Scan error:', err);
    });

    return { started: true };
  });
}
