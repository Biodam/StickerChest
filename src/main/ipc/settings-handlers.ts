import { ipcMain } from 'electron';
import { loadSettings, saveSettings } from '../services/settings/settings-store';
import { AppSettings } from '../../types/models';

export function registerSettingsIpcHandlers(): void {
  ipcMain.handle('settings:get', async () => {
    return loadSettings();
  });

  ipcMain.handle('settings:save', async (_event, partial: Partial<AppSettings>) => {
    try {
      saveSettings(partial);
      return true;
    } catch (err: any) {
      console.error('IPC settings:save error:', err);
      return false;
    }
  });
}
