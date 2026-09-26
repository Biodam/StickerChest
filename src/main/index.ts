import { app, BrowserWindow } from 'electron';
import { createMainWindow } from './windows/mainWindow';
import { createPickerWindow } from './windows/pickerWindow';
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from './shortcuts/globalShortcuts';
import { registerIpcHandlers } from './ipc';

try {
  if (require('electron-squirrel-startup')) {
    app.quit();
  }
} catch {
  // Not running squirrel installer
}

app.whenReady().then(() => {
  // Register IPC handlers
  registerIpcHandlers();

  // Create windows
  createMainWindow();
  createPickerWindow();

  // Register global shortcuts (e.g. Alt+Shift+V to toggle floating picker)
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
      createPickerWindow();
    }
  });
});

app.on('will-quit', () => {
  unregisterGlobalShortcuts();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
