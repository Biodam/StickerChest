import { BrowserWindow, shell } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow | null = null;

export function createMainWindow(): BrowserWindow {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    return mainWindow;
  }

  mainWindow = new BrowserWindow({
    title: 'StickerVault — Database Manager',
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#121316',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/main.preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // In development, load from Vite dev server URL
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}src/renderer/manager/index.html`);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/src/renderer/manager/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}
