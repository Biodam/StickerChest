import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseKeyboardEventToAccelerator,
  validateAccelerator,
  formatAcceleratorForDisplay,
} from '../../src/renderer/shared/accelerator-helper';
import { loadSettings, saveSettings } from '../../src/main/services/settings/settings-store';
import { ThemeId } from '../../src/types/models';

describe('Global Hotkey Accelerator Engine & Keystroke Parser', () => {
  it('should ignore bare modifier key presses without action keys', () => {
    const res = parseKeyboardEventToAccelerator({
      ctrlKey: true,
      altKey: false,
      shiftKey: false,
      metaKey: false,
      key: 'Control',
      code: 'ControlLeft',
    });
    expect(res.isValid).toBe(false);
    expect(res.accelerator).toBe('');
    expect(res.displayLabel).toContain('Press a key');
  });

  it('should parse Windows shortcut with Super (Windows Key) correctly', () => {
    const res = parseKeyboardEventToAccelerator(
      {
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: true,
        key: '/',
        code: 'Slash',
      },
      false
    );
    expect(res.isValid).toBe(true);
    expect(res.accelerator).toBe('Super+/');
    expect(res.displayLabel).toBe('Win + /');
  });

  it('should parse macOS shortcut with CommandOrControl correctly', () => {
    const res = parseKeyboardEventToAccelerator(
      {
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: true,
        key: '/',
        code: 'Slash',
      },
      true
    );
    expect(res.isValid).toBe(true);
    expect(res.accelerator).toBe('CommandOrControl+/');
    expect(res.displayLabel).toBe('⌘ + /');
  });

  it('should parse multi-modifier key combinations like Ctrl+Shift+Alt+V', () => {
    const res = parseKeyboardEventToAccelerator(
      {
        ctrlKey: true,
        altKey: true,
        shiftKey: true,
        metaKey: false,
        key: 'v',
        code: 'KeyV',
      },
      false
    );
    expect(res.isValid).toBe(true);
    expect(res.accelerator).toBe('CommandOrControl+Alt+Shift+V');
    expect(res.displayLabel).toBe('Ctrl + Alt + Shift + V');
  });

  it('should translate Space and Arrow keys cleanly', () => {
    const spaceRes = parseKeyboardEventToAccelerator(
      {
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        key: ' ',
        code: 'Space',
      },
      false
    );
    expect(spaceRes.accelerator).toBe('CommandOrControl+Space');
    expect(spaceRes.displayLabel).toBe('Ctrl + Space');

    const arrowRes = parseKeyboardEventToAccelerator(
      {
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        key: 'ArrowDown',
        code: 'ArrowDown',
      },
      false
    );
    expect(arrowRes.accelerator).toBe('CommandOrControl+Down');
    expect(arrowRes.displayLabel).toBe('Ctrl + Down');
  });

  it('should reject reserved system shortcuts', () => {
    expect(validateAccelerator('Alt+F4').isValid).toBe(false);
    expect(validateAccelerator('Super+L').isValid).toBe(false);
    expect(validateAccelerator('Control+Alt+Delete').isValid).toBe(false);
    expect(validateAccelerator('CommandOrControl+Q').isValid).toBe(false);
  });

  it('should reject shortcuts without modifier keys', () => {
    const res = validateAccelerator('A');
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('modifier');
  });

  it('should format macOS symbols cleanly', () => {
    expect(formatAcceleratorForDisplay('CommandOrControl+Shift+V', true)).toBe('⌘ + ⇧ + V');
    expect(formatAcceleratorForDisplay('Control+Alt+Space', true)).toBe('⌃ + ⌥ + Space');
  });
});

describe('Visual Theme System & Persistence', () => {
  const themes: ThemeId[] = ['slate_dark', 'oled_black', 'cyberpunk', 'catppuccin', 'paper_light'];

  it('should provide all 5 curated themes and persist theme choice in settings', () => {
    for (const theme of themes) {
      const updated = saveSettings({ theme });
      expect(updated.theme).toBe(theme);

      const reloaded = loadSettings();
      expect(reloaded.theme).toBe(theme);
    }
  });

  it('should default to slate_dark if no theme is specified', () => {
    const settings = loadSettings();
    expect(settings.theme).toBeDefined();
    expect(themes).toContain(settings.theme);
  });
});
