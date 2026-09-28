export interface ParsedAccelerator {
  accelerator: string;
  displayLabel: string;
  isValid: boolean;
  error?: string;
}

const RESERVED_ACCELERATORS = new Set([
  'alt+f4',
  'super+l',
  'commandorcontrol+q',
  'commandorcontrol+w',
  'commandorcontrol+alt+delete',
  'control+alt+delete',
  'f11',
]);

export function formatAcceleratorForDisplay(accelerator: string, isMac = false): string {
  if (!accelerator) return '';

  const parts = accelerator.split('+').map((p) => p.trim());
  const formattedParts = parts.map((part) => {
    const lower = part.toLowerCase();
    if (isMac) {
      if (lower === 'commandorcontrol' || lower === 'super' || lower === 'command') return '⌘';
      if (lower === 'control' || lower === 'ctrl') return '⌃';
      if (lower === 'alt' || lower === 'option') return '⌥';
      if (lower === 'shift') return '⇧';
    } else {
      if (lower === 'commandorcontrol') return 'Ctrl';
      if (lower === 'super') return 'Win';
      if (lower === 'control') return 'Ctrl';
    }
    if (lower === 'space') return 'Space';
    return part.length === 1 ? part.toUpperCase() : part;
  });

  return formattedParts.join(' + ');
}

export function validateAccelerator(accelerator: string): { isValid: boolean; error?: string } {
  if (!accelerator) {
    return { isValid: false, error: 'Shortcut cannot be empty' };
  }

  const normalized = accelerator.toLowerCase().trim();
  if (RESERVED_ACCELERATORS.has(normalized)) {
    return { isValid: false, error: 'This shortcut is reserved by the operating system' };
  }

  const parts = accelerator.split('+').map((p) => p.trim());
  const modifierKeys = new Set(['commandorcontrol', 'control', 'ctrl', 'alt', 'shift', 'super', 'meta']);
  const modifiers = parts.filter((p) => modifierKeys.has(p.toLowerCase()));
  const standardKeys = parts.filter((p) => !modifierKeys.has(p.toLowerCase()));

  if (modifiers.length === 0) {
    return { isValid: false, error: 'Shortcut must contain at least one modifier key (Ctrl, Alt, Shift, Win/Cmd)' };
  }

  if (standardKeys.length === 0) {
    return { isValid: false, error: 'Shortcut must include a key along with modifiers' };
  }

  if (standardKeys.length > 1) {
    return { isValid: false, error: 'Shortcut can only contain one action key' };
  }

  return { isValid: true };
}

export function parseKeyboardEventToAccelerator(
  event: {
    ctrlKey: boolean;
    altKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    key: string;
    code: string;
  },
  isMac = false
): ParsedAccelerator {
  const { ctrlKey, altKey, shiftKey, metaKey, key } = event;

  // Ignore bare modifier presses
  const isModifierOnly = ['Control', 'Alt', 'Shift', 'Meta'].includes(key);
  if (isModifierOnly) {
    return {
      accelerator: '',
      displayLabel: 'Press a key...',
      isValid: false,
    };
  }

  const parts: string[] = [];
  if (isMac) {
    if (ctrlKey) parts.push('Control');
    if (altKey) parts.push('Alt');
    if (shiftKey) parts.push('Shift');
    if (metaKey) parts.push('CommandOrControl');
  } else {
    if (ctrlKey) parts.push('CommandOrControl');
    if (altKey) parts.push('Alt');
    if (shiftKey) parts.push('Shift');
    if (metaKey) parts.push('Super');
  }

  let keyPart = key;
  if (key === ' ') keyPart = 'Space';
  else if (key.length === 1) keyPart = key.toUpperCase();
  else if (key.startsWith('Arrow')) keyPart = key.replace('Arrow', '');

  parts.push(keyPart);
  const accelerator = parts.join('+');
  const validation = validateAccelerator(accelerator);

  return {
    accelerator,
    displayLabel: formatAcceleratorForDisplay(accelerator, isMac),
    isValid: validation.isValid,
    error: validation.error,
  };
}
