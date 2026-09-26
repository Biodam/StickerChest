import { BrowserWindow, screen } from 'electron';
import path from 'path';

let pickerWindow: BrowserWindow | null = null;

export function createPickerWindow(): BrowserWindow {
  if (pickerWindow && !pickerWindow.isDestroyed()) {
    return pickerWindow;
  }

  pickerWindow = new BrowserWindow({
    title: 'StickerVault Quick Picker',
    width: 420,
    height: 520,
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/picker.preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    pickerWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}src/renderer/picker/index.html`);
  } else {
    pickerWindow.loadFile(path.join(__dirname, '../../dist/src/renderer/picker/index.html'));
  }

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

  const winWidth = 420;
  const winHeight = 520;
  const posX = Math.round(x + (width - winWidth) / 2);
  const posY = Math.round(y + (height - winHeight) / 2);

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
