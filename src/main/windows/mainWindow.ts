import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import fs from 'fs';

import { isAppQuitting } from './tray';

let mainWindow: BrowserWindow | null = null;

export function createMainWindow(): BrowserWindow {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    return mainWindow;
  }

  const appPath = app.getAppPath();
  const preloadPath = path.join(appPath, 'dist-electron/preload/main.preload.js');
  const indexPath = path.join(appPath, 'dist/src/renderer/manager/index.html');
  const iconPath = path.join(process.cwd(), 'resources', 'icon.png');

  console.log('[MainWindow] appPath:', appPath);
  console.log('[MainWindow] preloadPath:', preloadPath);
  console.log('[MainWindow] indexPath:', indexPath);

  mainWindow = new BrowserWindow({
    title: 'Sticker Chest — Database Manager',
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#121316',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on('close', (event) => {
    if (!isAppQuitting()) {
      event.preventDefault();
      mainWindow?.hide();
      console.log('[MainWindow] Minimized to tray');
    }
  });

  mainWindow.once('ready-to-show', () => {
    console.log('[MainWindow] ready-to-show triggered');
    mainWindow?.show();
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error('[MainWindow] did-fail-load:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('[MainWindow] render-process-gone:', details);
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // In development, load from Vite dev server URL
  const loadPromise = process.env.VITE_DEV_SERVER_URL
    ? mainWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}src/renderer/manager/index.html`)
    : mainWindow.loadFile(indexPath);

  loadPromise.then(() => {
    console.log('[MainWindow] load completed');
  }).catch((err) => {
    console.error('[MainWindow] Failed to load Manager window:', err);
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    console.log('[MainWindow] closed');
    mainWindow = null;
  });

  return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}
