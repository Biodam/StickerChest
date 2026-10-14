export interface ScreenBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CaretCoordinates {
  caretX?: number;
  caretY?: number;
}

export interface PickerPositionParams {
  caret?: CaretCoordinates;
  cursorPoint?: { x: number; y: number };
  workArea: ScreenBounds;
  displayBounds: ScreenBounds;
  pickerWidth?: number;
  pickerHeight?: number;
  padding?: number;
}

export const DEFAULT_PICKER_WIDTH = 460;
export const DEFAULT_PICKER_HEIGHT = 560;
export const DEFAULT_PICKER_PADDING = 12;
export const PICKER_WIDTH = DEFAULT_PICKER_WIDTH;
export const PICKER_HEIGHT = DEFAULT_PICKER_HEIGHT;

/**
 * Validates whether reported caret coordinates represent a real, plausible text caret
 * rather than a fallback window/screen bounding rectangle (like 0, screenHeight).
 */
export function isValidCaretPosition(
  caret: CaretCoordinates | undefined,
  displayBounds: ScreenBounds
): boolean {
  if (!caret) return false;
  const { caretX, caretY } = caret;
  if (typeof caretX !== 'number' || typeof caretY !== 'number') return false;
  if (Number.isNaN(caretX) || Number.isNaN(caretY)) return false;

  // Reject (0, 0)
  if (caretX === 0 && caretY === 0) return false;

  // Reject points at extreme bottom-left corners (common fallback when no text caret is present)
  const atBottomEdge = caretY >= displayBounds.y + displayBounds.height - 10;
  const atLeftEdge = caretX <= displayBounds.x + 5;
  if (atLeftEdge && atBottomEdge) return false;

  // Must be strictly within the display bounding box
  if (
    caretX < displayBounds.x ||
    caretX > displayBounds.x + displayBounds.width ||
    caretY < displayBounds.y ||
    caretY > displayBounds.y + displayBounds.height
  ) {
    return false;
  }

  return true;
}

/**
 * Clamps coordinates so the window rectangle is 100% inside the display workArea.
 */
export function clampToWorkArea(
  x: number,
  y: number,
  width: number,
  height: number,
  workArea: ScreenBounds,
  padding: number = DEFAULT_PICKER_PADDING
): { x: number; y: number } {
  const minX = workArea.x + padding;
  const maxX = Math.max(minX, workArea.x + workArea.width - width - padding);
  const minY = workArea.y + padding;
  const maxY = Math.max(minY, workArea.y + workArea.height - height - padding);

  const clampedX = Math.max(minX, Math.min(maxX, Math.round(x)));
  const clampedY = Math.max(minY, Math.min(maxY, Math.round(y)));

  return { x: clampedX, y: clampedY };
}

/**
 * Calculates optimal (x, y) screen coordinates for the Quick Picker window,
 * prioritizing the text caret if valid, or centering on the display as fallback,
 * and ALWAYS strictly clamping to the display workArea with a safety margin.
 */
export function calculatePickerPosition(params: PickerPositionParams): { x: number; y: number } {
  const width = params.pickerWidth ?? DEFAULT_PICKER_WIDTH;
  const height = params.pickerHeight ?? DEFAULT_PICKER_HEIGHT;
  const padding = params.padding ?? DEFAULT_PICKER_PADDING;
  const { workArea, displayBounds, caret } = params;

  let rawX: number;
  let rawY: number;

  if (isValidCaretPosition(caret, displayBounds)) {
    const cX = caret!.caretX!;
    const cY = caret!.caretY!;

    rawX = cX - 20;
    rawY = cY + 12;

    // Flip above caret if it would overflow the bottom of the work area
    if (rawY + height > workArea.y + workArea.height) {
      rawY = cY - height - 12;
    }
  } else {
    // Fallback: Center window inside the work area of the active display
    rawX = workArea.x + (workArea.width - width) / 2;
    rawY = workArea.y + (workArea.height - height) / 2;
  }

  // Strictly clamp inside the work area boundaries
  return clampToWorkArea(rawX, rawY, width, height, workArea, padding);
}
