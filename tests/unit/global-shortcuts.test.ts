import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock electron's globalShortcut module
const registeredCallbacks = new Map<string, () => void>();
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => 'C:\\test\\userData'),
  },
  globalShortcut: {
    register: vi.fn((accelerator: string, callback: () => void) => {
      registeredCallbacks.set(accelerator, callback);
      return true;
    }),
    unregisterAll: vi.fn(() => {
      registeredCallbacks.clear();
    }),
    isRegistered: vi.fn((accelerator: string) => registeredCallbacks.has(accelerator)),
  },
}));

vi.mock('../../src/main/windows/pickerWindow', () => ({
  togglePickerWindow: vi.fn(),
}));

import {
  DEFAULT_GLOBAL_SHORTCUT,
  registerGlobalShortcuts,
  unregisterGlobalShortcuts,
  getRegisteredShortcut,
  formatShortcutForDisplay,
} from '../../src/main/shortcuts/globalShortcuts';
import { globalShortcut } from 'electron';
import { togglePickerWindow } from '../../src/main/windows/pickerWindow';
import { loadSettings } from '../../src/main/services/settings/settings-store';

describe('Global Shortcuts Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    unregisterGlobalShortcuts();
  });

  it('should have a safe platform-appropriate default shortcut', () => {
    if (process.platform === 'darwin') {
      expect(DEFAULT_GLOBAL_SHORTCUT).toBe('Control+/');
    } else {
      expect(DEFAULT_GLOBAL_SHORTCUT).toBe('Super+/');
    }
  });

  it('should register the default shortcut successfully', () => {
    const success = registerGlobalShortcuts();
    expect(success).toBe(true);
    expect(globalShortcut.register).toHaveBeenCalledWith(
      DEFAULT_GLOBAL_SHORTCUT,
      expect.any(Function)
    );
    expect(getRegisteredShortcut()).toBe(DEFAULT_GLOBAL_SHORTCUT);
  });

  it('should allow custom shortcut registration', () => {
    const custom = 'Alt+Shift+S';
    const success = registerGlobalShortcuts(custom);
    expect(success).toBe(true);
    expect(globalShortcut.register).toHaveBeenCalledWith(custom, expect.any(Function));
    expect(getRegisteredShortcut()).toBe(custom);
  });

  it('should invoke togglePickerWindow when the shortcut callback is triggered', () => {
    registerGlobalShortcuts('Super+/');
    const callback = registeredCallbacks.get('Super+/');
    expect(callback).toBeDefined();
    callback?.();
    expect(togglePickerWindow).toHaveBeenCalledTimes(1);
  });

  it('should format shortcuts for readable display', () => {
    if (process.platform === 'darwin') {
      expect(formatShortcutForDisplay('Control+/')).toContain('⌃');
    } else {
      expect(formatShortcutForDisplay('Super+/')).toBe('Win+/');
      expect(formatShortcutForDisplay('CommandOrControl+Shift+V')).toBe('Ctrl+Shift+V');
    }
  });

  it('should default globalShortcut in settings-store to DEFAULT_GLOBAL_SHORTCUT', () => {
    const settings = loadSettings();
    expect(settings.globalShortcut).toBe(DEFAULT_GLOBAL_SHORTCUT);
  });
});
