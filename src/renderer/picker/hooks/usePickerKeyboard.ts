import { useEffect, RefObject } from 'react';
import { StickerItem } from '../../../types/models';
import {
  PickerTab,
  calculateNextIndex,
  getTabFromKey,
  getNextTab,
  isPrintableKey,
} from '../keyboard-navigation';

interface UsePickerKeyboardProps {
  items: StickerItem[];
  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: PickerTab;
  setActiveTab: (tab: PickerTab) => void;
  onToggleTier: () => void;
  onSelectItem: (item: StickerItem, isShiftPressed: boolean) => void;
  onToggleFavorite: (item: StickerItem) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

export function usePickerKeyboard({
  items,
  selectedIndex,
  setSelectedIndex,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  onToggleTier,
  onSelectItem,
  onToggleFavorite,
  searchInputRef,
}: UsePickerKeyboardProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const isInputActive = document.activeElement === searchInputRef.current;

      // 1. Two-stage Escape: Clear search first, hide window second
      if (e.key === 'Escape') {
        e.preventDefault();
        if (searchQuery.length > 0) {
          setSearchQuery('');
          searchInputRef.current?.focus();
        } else {
          window.stickerVault?.hidePicker?.();
        }
        return;
      }

      // 2. Tab switching shortcuts (Ctrl+1, Ctrl+2, Ctrl+3, Ctrl+Tab)
      const mappedTab = getTabFromKey(e.key, isCtrlOrCmd);
      if (mappedTab) {
        e.preventDefault();
        setActiveTab(mappedTab);
        return;
      }

      if (isCtrlOrCmd && e.key === 'Tab') {
        e.preventDefault();
        setActiveTab(getNextTab(activeTab, e.shiftKey ? 'prev' : 'next'));
        return;
      }

      // 3. Tier Toggle shortcut (Ctrl/Cmd + T)
      if (isCtrlOrCmd && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        onToggleTier();
        return;
      }

      // 4. Favorite Toggle shortcut (Ctrl/Cmd + S or Ctrl/Cmd + D)
      if (isCtrlOrCmd && (e.key === 's' || e.key === 'S' || e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        if (items[selectedIndex]) {
          onToggleFavorite(items[selectedIndex]);
        }
        return;
      }

      // 5. Enter to select & copy/paste
      if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          onSelectItem(items[selectedIndex], e.shiftKey);
        }
        return;
      }

      // 6. Navigation keys
      const isNavKey = [
        'ArrowRight',
        'ArrowLeft',
        'ArrowDown',
        'ArrowUp',
        'Home',
        'End',
        'PageDown',
        'PageUp',
      ].includes(e.key);

      if (isNavKey) {
        // If inside text input with non-empty query, let left/right move cursor inside text
        if (isInputActive && searchQuery.length > 0 && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          return;
        }

        e.preventDefault();
        setSelectedIndex((prev) => calculateNextIndex(prev, items.length, e.key));
        return;
      }

      // 7. Alphanumeric focus routing: if user types while not in search input, focus it
      if (!isInputActive && isPrintableKey(e)) {
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    items,
    selectedIndex,
    setSelectedIndex,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    onToggleTier,
    onSelectItem,
    onToggleFavorite,
    searchInputRef,
  ]);
}
