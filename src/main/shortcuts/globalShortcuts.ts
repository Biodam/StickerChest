import { globalShortcut } from 'electron';
import { togglePickerWindow } from '../windows/pickerWindow';

export const DEFAULT_GLOBAL_SHORTCUT =
  process.platform === 'darwin' ? 'Control+/' : 'Super+/';

let registeredShortcut = DEFAULT_GLOBAL_SHORTCUT;

export function formatShortcutForDisplay(shortcut: string = registeredShortcut): string {
  if (process.platform === 'darwin') {
    return shortcut
      .replace('CommandOrControl', '⌘')
      .replace('Control', '⌃')
      .replace('Super', '⌘')
      .replace('Alt', '⌥');
  }
  return shortcut
    .replace('CommandOrControl', 'Ctrl')
    .replace('Super', 'Win')
    .replace('Control', 'Ctrl');
}

export function registerGlobalShortcuts(shortcut?: string): boolean {
  if (shortcut) {
    registeredShortcut = shortcut;
  }

  // Unregister any existing shortcut first
  globalShortcut.unregisterAll();

  const success = globalShortcut.register(registeredShortcut, () => {
    togglePickerWindow();
  });

  if (!success) {
    console.error(`Failed to register global shortcut: ${registeredShortcut}`);
  } else {
    console.log(`Global shortcut registered: ${registeredShortcut} (${formatShortcutForDisplay(registeredShortcut)})`);
  }

  return success;
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
}

export function getRegisteredShortcut(): string {
  return registeredShortcut;
}

