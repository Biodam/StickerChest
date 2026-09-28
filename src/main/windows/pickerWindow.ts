import { app, BrowserWindow, screen } from 'electron';
import path from 'path';

let pickerWindow: BrowserWindow | null = null;

const PICKER_WIDTH = 460;
const PICKER_HEIGHT = 560;

export function createPickerWindow(): BrowserWindow {
  if (pickerWindow && !pickerWindow.isDestroyed()) {
    return pickerWindow;
  }

  const appPath = app.getAppPath();
  const preloadPath = path.join(appPath, 'dist-electron/preload/picker.preload.js');
  const indexPath = path.join(appPath, 'dist/src/renderer/picker/index.html');

  console.log('[PickerWindow] preloadPath:', preloadPath);
  console.log('[PickerWindow] indexPath:', indexPath);

  pickerWindow = new BrowserWindow({
    title: 'Sticker Chest Quick Picker',
    width: PICKER_WIDTH,
    height: PICKER_HEIGHT,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    hasShadow: true,
    webPreferences: {
      preload: preloadPath,
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  const loadPromise = process.env.VITE_DEV_SERVER_URL
    ? pickerWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}src/renderer/picker/index.html`)
    : pickerWindow.loadFile(indexPath);

  loadPromise.then(() => {
    console.log('[PickerWindow] load completed');
  }).catch((err) => {
    console.error('Failed to load Picker window:', err);
  });

  // Auto-hide when losing focus (exact behavior of Win + . or Raycast)
  pickerWindow.on('blur', () => {
    pickerWindow?.hide();
  });

  pickerWindow.on('closed', () => {
    pickerWindow = null;
  });

  return pickerWindow;
}

export function showPickerWindow(): void {
  if (!pickerWindow || pickerWindow.isDestroyed()) {
    createPickerWindow();
  }

  if (!pickerWindow) return;

  // Center window on current display where mouse cursor is located
  const cursorPoint = screen.getCursorScreenPoint();
  const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
  const { x, y, width, height } = currentDisplay.workArea;

  const posX = Math.round(x + (width - PICKER_WIDTH) / 2);
  const posY = Math.round(y + (height - PICKER_HEIGHT) / 2);

  pickerWindow.setPosition(posX, posY);
  pickerWindow.show();
  pickerWindow.focus();
}

export function hidePickerWindow(): void {
  pickerWindow?.hide();
}

export function togglePickerWindow(): void {
  if (pickerWindow && pickerWindow.isVisible()) {
    hidePickerWindow();
  } else {
    showPickerWindow();
  }
}

export function getPickerWindow(): BrowserWindow | null {
  return pickerWindow;
}
