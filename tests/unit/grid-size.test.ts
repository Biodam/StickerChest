import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  clampGridSize,
  DEFAULT_GRID_SIZE,
  MIN_GRID_SIZE,
  MAX_GRID_SIZE,
  STORAGE_KEY,
} from '../../src/renderer/manager/hooks/useGridSize';

describe('Grid Size Management & Hook Logic', () => {
  beforeEach(() => {
    // Reset localStorage mock
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
    });
  });

  it('should verify clampGridSize constraints correctly', () => {
    expect(clampGridSize(50)).toBe(MIN_GRID_SIZE);
    expect(clampGridSize(500)).toBe(MAX_GRID_SIZE);
    expect(clampGridSize(180)).toBe(180);
    expect(clampGridSize(MIN_GRID_SIZE)).toBe(MIN_GRID_SIZE);
    expect(clampGridSize(MAX_GRID_SIZE)).toBe(MAX_GRID_SIZE);
  });

  it('should have standard default grid size constants', () => {
    expect(DEFAULT_GRID_SIZE).toBe(160);
    expect(MIN_GRID_SIZE).toBe(100);
    expect(MAX_GRID_SIZE).toBe(260);
    expect(STORAGE_KEY).toBe('stickerchest_grid_size');
  });

  it('should save and retrieve grid size from localStorage', () => {
    localStorage.setItem(STORAGE_KEY, '220');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('220');
  });
});
