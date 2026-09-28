import { ipcMain } from 'electron';
import { getSyncManager } from '../services/sync/sync-manager';

export function registerSyncIpcHandlers(): void {
  ipcMain.handle('sync:getAccountInfo', async () => {
    return getSyncManager().getAccountInfo();
  });

  ipcMain.handle('sync:connectGoogleDrive', async (_, clientId?: string) => {
    return getSyncManager().connect(clientId);
  });

  ipcMain.handle('sync:disconnectGoogleDrive', async () => {
    return getSyncManager().disconnect();
  });

  ipcMain.handle('sync:triggerSync', async () => {
    return getSyncManager().syncNow();
  });
}
