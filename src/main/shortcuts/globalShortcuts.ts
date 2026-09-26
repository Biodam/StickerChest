import { globalShortcut } from 'electron';
import { togglePickerWindow } from '../windows/pickerWindow';

let registeredShortcut = 'Alt+Shift+V';

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
    console.log(`Global shortcut registered: ${registeredShortcut}`);
  }

  return success;
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll();
}

export function getRegisteredShortcut(): string {
  return registeredShortcut;
}
