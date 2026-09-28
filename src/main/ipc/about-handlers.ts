import { ipcMain } from 'electron';
import { getAboutInfo } from '../services/app-info/about-service';

export function registerAboutIpcHandlers(): void {
  ipcMain.handle('app:getAboutInfo', () => {
    return getAboutInfo();
  });
}
