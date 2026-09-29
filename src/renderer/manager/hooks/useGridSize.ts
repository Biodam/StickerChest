import { useState } from 'react';

export const STORAGE_KEY = 'stickerchest_grid_size';
export const DEFAULT_GRID_SIZE = 160;
export const MIN_GRID_SIZE = 100;
export const MAX_GRID_SIZE = 260;

export function clampGridSize(size: number): number {
  return Math.max(MIN_GRID_SIZE, Math.min(MAX_GRID_SIZE, size));
}

export function useGridSize() {
  const [gridSize, setGridSizeState] = useState<number>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const val = parseInt(saved, 10);
          if (!Number.isNaN(val) && val >= MIN_GRID_SIZE && val <= MAX_GRID_SIZE) {
            return val;
          }
        }
      }
    } catch {}
    return DEFAULT_GRID_SIZE;
  });

  const setGridSize = (size: number) => {
    const clamped = clampGridSize(size);
    setGridSizeState(clamped);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, clamped.toString());
      }
    } catch {}
  };

  return { gridSize, setGridSize };
}
