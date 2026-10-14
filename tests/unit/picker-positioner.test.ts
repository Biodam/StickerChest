import { describe, it, expect } from 'vitest';
import {
  isValidCaretPosition,
  clampToWorkArea,
  calculatePickerPosition,
  DEFAULT_PICKER_WIDTH,
  DEFAULT_PICKER_HEIGHT,
  DEFAULT_PICKER_PADDING,
} from '../../src/main/windows/picker-positioner';

describe('isValidCaretPosition', () => {
  const displayBounds = { x: 0, y: 0, width: 1920, height: 1080 };

  it('accepts valid caret coordinates inside screen bounds', () => {
    expect(isValidCaretPosition({ caretX: 300, caretY: 400 }, displayBounds)).toBe(true);
    expect(isValidCaretPosition({ caretX: 100, caretY: 100 }, displayBounds)).toBe(true);
  });

  it('rejects undefined, null, and NaN coordinates', () => {
    expect(isValidCaretPosition(undefined, displayBounds)).toBe(false);
    expect(isValidCaretPosition({}, displayBounds)).toBe(false);
    expect(isValidCaretPosition({ caretX: NaN, caretY: 400 }, displayBounds)).toBe(false);
    expect(isValidCaretPosition({ caretX: 400, caretY: NaN }, displayBounds)).toBe(false);
  });

  it('rejects (0, 0)', () => {
    expect(isValidCaretPosition({ caretX: 0, caretY: 0 }, displayBounds)).toBe(false);
  });

  it('rejects bogus bottom-left window bounding rectangle fallback (e.g. 0, 1080 or 0, 2160)', () => {
    expect(isValidCaretPosition({ caretX: 0, caretY: 1080 }, displayBounds)).toBe(false);
    expect(isValidCaretPosition({ caretX: 0, caretY: 1075 }, displayBounds)).toBe(false);
  });

  it('rejects coordinates strictly outside display bounds', () => {
    expect(isValidCaretPosition({ caretX: -50, caretY: 400 }, displayBounds)).toBe(false);
    expect(isValidCaretPosition({ caretX: 400, caretY: -20 }, displayBounds)).toBe(false);
    expect(isValidCaretPosition({ caretX: 2000, caretY: 400 }, displayBounds)).toBe(false);
    expect(isValidCaretPosition({ caretX: 400, caretY: 1200 }, displayBounds)).toBe(false);
  });
});

describe('clampToWorkArea', () => {
  const workArea = { x: 0, y: 0, width: 1920, height: 1040 };

  it('clamps coordinates that would overflow above top of screen', () => {
    const res = clampToWorkArea(500, -30, DEFAULT_PICKER_WIDTH, DEFAULT_PICKER_HEIGHT, workArea, DEFAULT_PICKER_PADDING);
    expect(res.y).toBe(DEFAULT_PICKER_PADDING);
  });

  it('clamps coordinates that would overflow bottom of workArea', () => {
    const res = clampToWorkArea(500, 900, DEFAULT_PICKER_WIDTH, DEFAULT_PICKER_HEIGHT, workArea, DEFAULT_PICKER_PADDING);
    expect(res.y).toBe(workArea.height - DEFAULT_PICKER_HEIGHT - DEFAULT_PICKER_PADDING);
    expect(res.y + DEFAULT_PICKER_HEIGHT).toBeLessThanOrEqual(workArea.height - DEFAULT_PICKER_PADDING);
  });

  it('clamps coordinates that would overflow left edge', () => {
    const res = clampToWorkArea(-50, 200, DEFAULT_PICKER_WIDTH, DEFAULT_PICKER_HEIGHT, workArea, DEFAULT_PICKER_PADDING);
    expect(res.x).toBe(DEFAULT_PICKER_PADDING);
  });

  it('clamps coordinates that would overflow right edge', () => {
    const res = clampToWorkArea(1800, 200, DEFAULT_PICKER_WIDTH, DEFAULT_PICKER_HEIGHT, workArea, DEFAULT_PICKER_PADDING);
    expect(res.x).toBe(workArea.width - DEFAULT_PICKER_WIDTH - DEFAULT_PICKER_PADDING);
    expect(res.x + DEFAULT_PICKER_WIDTH).toBeLessThanOrEqual(workArea.width - DEFAULT_PICKER_PADDING);
  });

  it('handles multi-monitor secondary display with negative offset', () => {
    const secondaryWorkArea = { x: 1920, y: -500, width: 2560, height: 1400 };
    const res = clampToWorkArea(1900, -600, DEFAULT_PICKER_WIDTH, DEFAULT_PICKER_HEIGHT, secondaryWorkArea, 12);
    expect(res.x).toBe(1920 + 12);
    expect(res.y).toBe(-500 + 12);
  });

  it('handles taskbar on top of screen', () => {
    const topTaskbarWorkArea = { x: 0, y: 40, width: 1920, height: 1040 };
    const res = clampToWorkArea(500, 10, DEFAULT_PICKER_WIDTH, DEFAULT_PICKER_HEIGHT, topTaskbarWorkArea, 12);
    expect(res.y).toBe(40 + 12);
  });
});

describe('calculatePickerPosition', () => {
  const displayBounds = { x: 0, y: 0, width: 1920, height: 1080 };
  const workArea = { x: 0, y: 0, width: 1920, height: 1040 };

  it('never places the top of the window outside the screen when caret is near the top', () => {
    const res = calculatePickerPosition({
      caret: { caretX: 200, caretY: 5 },
      workArea,
      displayBounds,
    });
    expect(res.y).toBeGreaterThanOrEqual(workArea.y + DEFAULT_PICKER_PADDING);
    expect(res.x).toBeGreaterThanOrEqual(workArea.x + DEFAULT_PICKER_PADDING);
  });

  it('flips and clamps when caret is near the bottom of the screen', () => {
    const res = calculatePickerPosition({
      caret: { caretX: 500, caretY: 1000 },
      workArea,
      displayBounds,
    });
    expect(res.y).toBeLessThanOrEqual(workArea.height - DEFAULT_PICKER_HEIGHT - DEFAULT_PICKER_PADDING);
    expect(res.y).toBeGreaterThanOrEqual(workArea.y + DEFAULT_PICKER_PADDING);
  });

  it('centers window inside work area when caret is invalid or bogus', () => {
    const res = calculatePickerPosition({
      caret: { caretX: 0, caretY: 1080 }, // bogus bottom-left fallback
      cursorPoint: { x: 500, y: 500 },
      workArea,
      displayBounds,
    });
    const expectedX = Math.round(workArea.x + (workArea.width - DEFAULT_PICKER_WIDTH) / 2);
    const expectedY = Math.round(workArea.y + (workArea.height - DEFAULT_PICKER_HEIGHT) / 2);
    expect(res.x).toBe(expectedX);
    expect(res.y).toBe(expectedY);
  });

  it('centers window inside work area when no caret is provided', () => {
    const res = calculatePickerPosition({
      cursorPoint: { x: 500, y: 500 },
      workArea,
      displayBounds,
    });
    const expectedX = Math.round(workArea.x + (workArea.width - DEFAULT_PICKER_WIDTH) / 2);
    const expectedY = Math.round(workArea.y + (workArea.height - DEFAULT_PICKER_HEIGHT) / 2);
    expect(res.x).toBe(expectedX);
    expect(res.y).toBe(expectedY);
  });
});
