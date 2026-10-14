import { ipcMain, dialog, shell } from 'electron';
import { hidePickerWindow } from '../windows/pickerWindow';
import { createMainWindow, getMainWindow } from '../windows/mainWindow';
import { registerDbIpcHandlers } from './db-handlers';
import { registerVaultIpcHandlers } from './vault-handlers';
import { registerGeminiIpcHandlers } from './gemini-handlers';
import { registerSettingsIpcHandlers } from './settings-handlers';
import { registerClipboardIpcHandlers } from './clipboard-handlers';
import { registerExportIpcHandlers } from './export-handlers';
import { registerSyncIpcHandlers } from './sync-handlers';
import { registerBackgroundIpcHandlers } from './background-handlers';
import { registerAboutIpcHandlers } from './about-handlers';
import { registerLoggerIpcHandlers } from './logger-handlers';

export function registerIpcHandlers(): void {
  // Logger handlers
  registerLoggerIpcHandlers();

  // App & About handlers
  registerAboutIpcHandlers();
  // Database handlers
  registerDbIpcHandlers();

  // Vault & Ingestion handlers
  registerVaultIpcHandlers();

  // Gemini AI handlers
  registerGeminiIpcHandlers();

  // Settings handlers
  registerSettingsIpcHandlers();

  // Clipboard handlers
  registerClipboardIpcHandlers();

  // Vault Backup, Restore & Pack Exporters
  registerExportIpcHandlers();

  // Google Drive Cloud Sync handlers
  registerSyncIpcHandlers();

  // Background removal handler
  registerBackgroundIpcHandlers();


  // Window Controls
  ipcMain.handle('window:hidePicker', async () => {
    hidePickerWindow();
  });

  ipcMain.handle('window:openManager', async () => {
    createMainWindow();
  });

  ipcMain.handle('dialog:selectFolder', async () => {
    const mainWindow = getMainWindow();
    const result = await dialog.showOpenDialog(mainWindow || (undefined as any), {
      properties: ['openDirectory'],
      title: 'Select Curated Stickers Folder',
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle('dialog:selectImages', async () => {
    const mainWindow = getMainWindow();
    const result = await dialog.showOpenDialog(mainWindow || (undefined as any), {
      properties: ['openFile', 'multiSelections'],
      title: 'Select Sticker Images to Import',
      filters: [
        { name: 'Images & GIFs', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    if (result.canceled || !result.filePaths) {
      return [];
    }
    return result.filePaths;
  });

  ipcMain.handle('app:openExternal', async (_event, url: string) => {
    try {
      if (typeof url === 'string' && (url.startsWith('https://') || url.startsWith('http://'))) {
        await shell.openExternal(url);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to open external URL:', err);
      return false;
    }
  });
}
