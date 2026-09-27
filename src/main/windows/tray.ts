import { app, Menu, Tray, nativeImage } from 'electron';
import path from 'path';
import { getMainWindow, createMainWindow } from './mainWindow';
import { togglePickerWindow } from './pickerWindow';
import { getRegisteredShortcut, formatShortcutForDisplay } from '../shortcuts/globalShortcuts';

let tray: Tray | null = null;
let isQuitting = false;

export function isAppQuitting(): boolean {
  return isQuitting;
}

export function setAppQuitting(quitting: boolean): void {
  isQuitting = quitting;
}

export function quitApp(): void {
  isQuitting = true;
  app.quit();
}

function getTrayIconPath(): string {
  const isDev = !app.isPackaged;
  const basePath = isDev
    ? path.join(process.cwd(), 'resources')
    : path.join(process.resourcesPath, 'resources');

  const trayPath = path.join(basePath, 'tray-icon.png');
  return trayPath;
}

export function createTray(): Tray {
  if (tray) return tray;

  const iconPath = getTrayIconPath();
  const icon = nativeImage.createFromPath(iconPath);

  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('StickerVault — Companion & Quick Picker');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Manager',
      click: () => {
        const mainWindow = getMainWindow() || createMainWindow();
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      },
    },
    {
      label: `Quick Picker (${formatShortcutForDisplay(getRegisteredShortcut())})`,
      click: () => {
        togglePickerWindow();
      },
    },
    { type: 'separator' },
    {
      label: 'Quit StickerVault',
      click: () => {
        quitApp();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    const mainWindow = getMainWindow();
    if (mainWindow && mainWindow.isVisible()) {
      if (mainWindow.isFocused()) {
        mainWindow.hide();
      } else {
        mainWindow.focus();
      }
    } else {
      const win = mainWindow || createMainWindow();
      if (win.isMinimized()) win.restore();
      win.show();
      win.focus();
    }
  });

  return tray;
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
