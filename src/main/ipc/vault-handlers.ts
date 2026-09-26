import { ipcMain, BrowserWindow, shell } from 'electron';
import { getIngestionService } from '../services/ingestion/folder-watcher';
import { loadSettings } from '../services/settings/settings-store';
import { resolveVaultPath } from '../services/ingestion/paths';

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
    const targetFolder = folderPath || ingestionService.getWatchedPath() || loadSettings().sourceFolder;
    if (!targetFolder) {
      return { started: false, error: 'No folder path configured' };
    }

    // Launch scan asynchronously so IPC returns immediately
    ingestionService.scanFolder(targetFolder, forceReprocess).catch((err) => {
      console.error('Scan error:', err);
    });

    return { started: true };
  });

  ipcMain.handle('vault:showItemInFolder', async (_event, filePath: string) => {
    try {
      const resolved = resolveVaultPath(filePath);
      shell.showItemInFolder(resolved);
      return true;
    } catch (err: any) {
      console.error('IPC vault:showItemInFolder error:', err);
      return false;
    }
  });
}
