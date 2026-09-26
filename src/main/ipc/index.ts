import { ipcMain, dialog } from 'electron';
import { hidePickerWindow } from '../windows/pickerWindow';
import { createMainWindow, getMainWindow } from '../windows/mainWindow';

export function registerIpcHandlers(): void {
  // Window Controls
  ipcMain.handle('window:hidePicker', async () => {
    hidePickerWindow();
  });

  ipcMain.handle('window:openManager', async () => {
    createMainWindow();
  });

  ipcMain.handle('dialog:selectFolder', async () => {
    const mainWindow = getMainWindow();
    const result = await dialog.showOpenDialog(mainWindow || undefined as any, {
      properties: ['openDirectory'],
      title: 'Select Curated Stickers Folder',
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  // Stubs for upcoming tasks (Task 2: Database, Task 3: Ingestion, Task 4: Gemini, etc.)
  ipcMain.handle('db:search', async (_event, options) => {
    return { items: [], total: 0 };
  });

  ipcMain.handle('db:getItem', async (_event, id) => {
    return null;
  });

  ipcMain.handle('db:toggleFavorite', async (_event, itemId) => {
    return false;
  });

  ipcMain.handle('db:updateMetadata', async (_event, itemId, metadata) => {
    return true;
  });

  ipcMain.handle('clipboard:copyItem', async (_event, itemId, tier) => {
    return true;
  });

  ipcMain.handle('vault:scan', async (_event, forceReprocess) => {
    return { started: true };
  });

  ipcMain.handle('gemini:tagItem', async (_event, itemId) => {
    return false;
  });

  ipcMain.handle('gemini:testKey', async (_event, apiKey) => {
    return { valid: true, message: 'Valid format' };
  });

  ipcMain.handle('settings:get', async () => {
    return {
      sourceFolder: '',
      geminiApiKey: '',
      geminiModel: 'gemini-2.5-flash',
      globalShortcut: 'Alt+Shift+V',
      preferredCopyTier: 'sticker',
      autoStartAtLogin: false,
    };
  });

  ipcMain.handle('settings:save', async (_event, settings) => {
    return true;
  });
}
