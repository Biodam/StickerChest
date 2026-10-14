import { app, BrowserWindow, screen } from 'electron';
import path from 'path';
import { detectTargetContext } from '../services/clipboard/paste-simulator';
import { logger } from '../services/logger/logger';
import { calculatePickerPosition, PICKER_WIDTH, PICKER_HEIGHT } from './picker-positioner';

let pickerWindow: BrowserWindow | null = null;
let lastTargetHwnd: string | null = null;

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

  // 2. Normalize caret coordinates (convert physical to DIP if needed)
  const caretCoords = {
    caretX: target.caretX,
    caretY: target.caretY,
  };

  if (
    typeof (screen as any).screenToDipPoint === 'function' &&
    typeof target.caretX === 'number' &&
    typeof target.caretY === 'number'
  ) {
    try {
      const dip = (screen as any).screenToDipPoint({ x: target.caretX, y: target.caretY });
      caretCoords.caretX = dip.x;
      caretCoords.caretY = dip.y;
    } catch {
      // Fallback to raw coords
    }
  }

  const cursorPoint = screen.getCursorScreenPoint();
  const targetPoint =
    typeof caretCoords.caretX === 'number' &&
    typeof caretCoords.caretY === 'number' &&
    (caretCoords.caretX !== 0 || caretCoords.caretY !== 0)
      ? { x: caretCoords.caretX, y: caretCoords.caretY }
      : cursorPoint;

  const display = screen.getDisplayNearestPoint(targetPoint);

  const { x: posX, y: posY } = calculatePickerPosition({
    caret: caretCoords,
    cursorPoint,
    workArea: display.workArea,
    displayBounds: display.bounds,
    pickerWidth: PICKER_WIDTH,
    pickerHeight: PICKER_HEIGHT,
  });

  logger.info(
    'PickerWindow',
    `Positioned picker at (${posX}, ${posY}) for target (${target.caretX}, ${target.caretY}) on workArea [${display.workArea.x}, ${display.workArea.y}, ${display.workArea.width}, ${display.workArea.height}]`
  );

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
