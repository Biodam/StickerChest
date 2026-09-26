import { ipcMain, dialog } from 'electron';
import { hidePickerWindow } from '../windows/pickerWindow';
import { createMainWindow, getMainWindow } from '../windows/mainWindow';
import { registerDbIpcHandlers } from './db-handlers';
import { registerVaultIpcHandlers } from './vault-handlers';
import { registerGeminiIpcHandlers } from './gemini-handlers';

export function registerIpcHandlers(): void {
  // Database handlers
  registerDbIpcHandlers();

  // Vault & Ingestion handlers
  registerVaultIpcHandlers();

  // Gemini AI handlers
  registerGeminiIpcHandlers();

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

  // Stubs for upcoming tasks (Task 6: Clipboard)
  ipcMain.handle('clipboard:copyItem', async (_event, itemId, tier) => {
    return true;
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
