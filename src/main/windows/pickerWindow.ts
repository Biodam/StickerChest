import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { detectTargetContext } from '../services/clipboard/paste-simulator';
import { logger } from '../services/logger/logger';

let pickerWindow: BrowserWindow | null = null;
let lastTargetHwnd: string | null = null;

const PICKER_WIDTH = 460;
const PICKER_HEIGHT = 560;

export function getLastTargetHwnd(): string | null {
  return lastTargetHwnd;
}

export function createPickerWindow(): BrowserWindow {
  if (pickerWindow && !pickerWindow.isDestroyed()) {
    return pickerWindow;
  }

  const appPath = app.getAppPath();
  const preloadPath = path.join(appPath, 'dist-electron/preload/picker.preload.js');
  const indexPath = path.join(appPath, 'dist/src/renderer/picker/index.html');

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

  loadPromise.catch((err) => {
    logger.error('PickerWindow', `Failed to load Picker window: ${err.message}`, err);
  });

  // Auto-hide when losing focus
  pickerWindow.on('blur', () => {
    pickerWindow?.hide();
  });

  pickerWindow.on('closed', () => {
    pickerWindow = null;
  });

  return pickerWindow;
}

export function showPickerWindow(): void {
  // 1. Detect target context (active window HWND and caret coordinates) BEFORE showing picker
  const target = detectTargetContext();
  if (target.hwnd) {
    lastTargetHwnd = target.hwnd;
    logger.info('PickerWindow', `Captured target window HWND: ${lastTargetHwnd}`);
  }

  if (!pickerWindow || pickerWindow.isDestroyed()) {
    createPickerWindow();
  }

  if (!pickerWindow) return;

  // 2. Position near the caret position if detected
  let posX: number;
  let posY: number;

  if (target.caretX && target.caretX > 0 && target.caretY && target.caretY > 0) {
    const display = screen.getDisplayNearestPoint({ x: target.caretX, y: target.caretY });
    const { x: dX, y: dY, width: dW, height: dH } = display.workArea;

    posX = target.caretX - 20;
    posY = target.caretY + 12;

    // Flip above caret if it would overflow the bottom of the screen
    if (posY + PICKER_HEIGHT > dY + dH) {
      posY = Math.max(dY + 10, target.caretY - PICKER_HEIGHT - 12);
    }

    // Clamp horizontally to stay inside display boundaries
    if (posX + PICKER_WIDTH > dX + dW) {
      posX = dX + dW - PICKER_WIDTH - 12;
    }
    if (posX < dX + 12) {
      posX = dX + 12;
    }

    logger.info('PickerWindow', `Positioning picker near caret at (${posX}, ${posY}) for caret (${target.caretX}, ${target.caretY})`);
  } else {
    // Fallback: center window on display nearest to mouse cursor
    const cursorPoint = screen.getCursorScreenPoint();
    const currentDisplay = screen.getDisplayNearestPoint(cursorPoint);
    const { x, y, width, height } = currentDisplay.workArea;

    posX = Math.round(x + (width - PICKER_WIDTH) / 2);
    posY = Math.round(y + (height - PICKER_HEIGHT) / 2);
    logger.info('PickerWindow', `Caret not detected; centering on display at (${posX}, ${posY})`);
  }

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
