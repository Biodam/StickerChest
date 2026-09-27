import { useState, useCallback, useEffect } from 'react';
import { StickerItem } from '../../../types/models';

export function useSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setLastSelectedId(null);
  }, []);

  const selectAll = useCallback((items: StickerItem[]) => {
    setSelectedIds(new Set(items.map((i) => i.id)));
  }, []);

  const handleSelect = useCallback(
    (
      item: StickerItem,
      items: StickerItem[],
      e?: React.MouseEvent,
      onSingleSelect?: (it: StickerItem | null) => void
    ) => {
      const isCtrl = e ? e.ctrlKey || e.metaKey : false;
      const isShift = e ? e.shiftKey : false;

      if (isShift && lastSelectedId) {
        const lastIdx = items.findIndex((i) => i.id === lastSelectedId);
        const currIdx = items.findIndex((i) => i.id === item.id);
        if (lastIdx !== -1 && currIdx !== -1) {
          const start = Math.min(lastIdx, currIdx);
          const end = Math.max(lastIdx, currIdx);
          const rangeIds = new Set(selectedIds);
          for (let i = start; i <= end; i++) {
            rangeIds.add(items[i].id);
          }
          setSelectedIds(rangeIds);
          if (onSingleSelect) onSingleSelect(null);
          return;
        }
      }

      if (isCtrl) {
        const next = new Set(selectedIds);
        if (next.has(item.id)) {
          next.delete(item.id);
        } else {
          next.add(item.id);
        }
        setSelectedIds(next);
        setLastSelectedId(item.id);
        if (onSingleSelect) onSingleSelect(next.size === 1 ? item : null);
        return;
      }

      // Normal single click
      if (selectedIds.size > 1) {
        // Clear multi-select and select this single item
        setSelectedIds(new Set([item.id]));
        setLastSelectedId(item.id);
        if (onSingleSelect) onSingleSelect(item);
      } else {
        setSelectedIds(new Set([item.id]));
        setLastSelectedId(item.id);
        if (onSingleSelect) onSingleSelect(item);
      }
    },
    [lastSelectedId, selectedIds]
  );

  // Clear selection on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSelection();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearSelection]);

  return {
    selectedIds,
    handleSelect,
    clearSelection,
    selectAll,
    isMultiSelect: selectedIds.size > 1,
  };
}
