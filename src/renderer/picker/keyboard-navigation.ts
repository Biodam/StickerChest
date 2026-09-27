export type PickerTab = 'recent' | 'favorites' | 'all';

export const GRID_COLUMNS = 4;
export const PAGE_ROWS = 4;

/**
 * Calculates next selected index in a 2D grid based on keyboard navigation keys.
 */
export function calculateNextIndex(
  currentIndex: number,
  totalCount: number,
  key: string,
  columns: number = GRID_COLUMNS
): number {
  if (totalCount <= 0) return 0;

  switch (key) {
    case 'ArrowRight':
      return Math.min(currentIndex + 1, totalCount - 1);
    case 'ArrowLeft':
      return Math.max(currentIndex - 1, 0);
    case 'ArrowDown':
      return Math.min(currentIndex + columns, totalCount - 1);
    case 'ArrowUp':
      return Math.max(currentIndex - columns, 0);
    case 'Home':
      return 0;
    case 'End':
      return Math.max(0, totalCount - 1);
    case 'PageDown':
      return Math.min(currentIndex + columns * PAGE_ROWS, totalCount - 1);
    case 'PageUp':
      return Math.max(currentIndex - columns * PAGE_ROWS, 0);
    default:
      return currentIndex;
  }
}

/**
 * Maps Ctrl/Cmd + number keys to corresponding picker tabs.
 */
export function getTabFromKey(key: string, isCtrlOrCmd: boolean): PickerTab | null {
  if (!isCtrlOrCmd) return null;
  if (key === '1') return 'recent';
  if (key === '2') return 'favorites';
  if (key === '3') return 'all';
  return null;
}

/**
 * Cycles through available tabs in forward or backward order.
 */
export function getNextTab(currentTab: PickerTab, direction: 'next' | 'prev'): PickerTab {
  const tabs: PickerTab[] = ['recent', 'favorites', 'all'];
  const currentIndex = tabs.indexOf(currentTab);
  if (currentIndex === -1) return 'recent';

  if (direction === 'next') {
    return tabs[(currentIndex + 1) % tabs.length];
  } else {
    return tabs[(currentIndex - 1 + tabs.length) % tabs.length];
  }
}

/**
 * Checks whether a key corresponds to printable text that should be routed to the search bar.
 */
export function isPrintableKey(e: { key: string; ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean }): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  return e.key.length === 1;
}
