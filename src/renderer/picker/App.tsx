import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PickerSearch } from './components/PickerSearch';
import { PickerTabs } from './components/PickerTabs';
import { PickerGrid } from './components/PickerGrid';
import { PickerFooter } from './components/PickerFooter';
import { StickerItem, ImageTier } from '../../types/models';
import { PickerTab } from './keyboard-navigation';
import { usePickerKeyboard } from './hooks/usePickerKeyboard';

export default function PickerApp() {
  const api = window.stickerChest || window.stickerVault;
  const [activeTab, setActiveTab] = useState<PickerTab>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<StickerItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copyTier, setCopyTier] = useState<ImageTier>('sticker');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    if (!api?.searchItems) return;
    const isSearching = searchQuery.trim().length > 0;
    const res = await api.searchItems({
      query: searchQuery,
      tab: isSearching ? 'all' : activeTab,
      limit: 48,
    });
    setItems(res.items);
    setSelectedIndex(0);
  }, [api, searchQuery, activeTab]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    api?.getSettings?.().then((settings) => {
      if (settings?.theme) {
        document.documentElement.setAttribute('data-theme', settings.theme);
      }
    });

    return api?.onThemeChanged?.((theme) => {
      document.documentElement.setAttribute('data-theme', theme);
    });
  }, [api]);

  const handleSelectItem = useCallback(
    async (item: StickerItem, isShiftPressed: boolean = false) => {
      if (!item) return;

      api?.logMessage?.(
        'INFO',
        'PickerApp',
        `handleSelectItem called for ${item.id} (${item.filename}), tier=${copyTier}, isShift=${isShiftPressed}`
      );

      try {
        if (isShiftPressed) {
          // Shift+Enter: copy only without auto-paste, then dismiss
          api?.logMessage?.('INFO', 'PickerApp', 'Invoking copyItemToClipboard (shiftPressed)...');
          await api?.copyItemToClipboard?.(item.id, copyTier);
          await api?.hidePicker?.();
        } else if (api?.copyAndPasteItem) {
          // Enter: main process handles clipboard copy, window hiding, and virtual paste
          api?.logMessage?.('INFO', 'PickerApp', 'Invoking copyAndPasteItem via IPC...');
          const result = await api.copyAndPasteItem(item.id, copyTier);
          api?.logMessage?.('INFO', 'PickerApp', `copyAndPasteItem IPC finished with result: ${result}`);
        } else if (api?.copyItemToClipboard) {
          api?.logMessage?.('WARN', 'PickerApp', 'copyAndPasteItem missing on API, falling back to copyItemToClipboard');
          await api.copyItemToClipboard(item.id, copyTier);
          await api?.hidePicker?.();
        }
      } catch (err: any) {
        api?.logMessage?.('ERROR', 'PickerApp', `Failed to copy and paste sticker: ${err.message}`, err);
        console.error('Failed to copy and paste sticker:', err);
      }
    },
    [api, copyTier]
  );

  const handleToggleFavorite = async (item: StickerItem) => {
    if (!api?.toggleFavorite) return;
    await api.toggleFavorite(item.id);
    const updatedStatus = !item.usage?.isFavorite;

    setItems((prev) =>
      prev
        .map((it) =>
          it.id === item.id
            ? { ...it, usage: { ...it.usage, isFavorite: updatedStatus } }
            : it
        )
        .filter((it) => (activeTab === 'favorites' ? it.usage?.isFavorite : true))
    );
  };

  const handleToggleTier = () => {
    setCopyTier((prev) => (prev === 'sticker' ? 'emoji' : 'sticker'));
  };

  // Register window-level keyboard listener & controls
  usePickerKeyboard({
    items,
    selectedIndex,
    setSelectedIndex,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    onToggleTier: handleToggleTier,
    onSelectItem: handleSelectItem,
    onToggleFavorite: handleToggleFavorite,
    searchInputRef,
  });

  return (
    <div className="w-[460px] h-[560px] bg-[#1a1b1e]/95 backdrop-blur-xl border border-[#2c2e33] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#f1f3f5]">
      <PickerSearch
        ref={searchInputRef}
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
      />

      <PickerTabs
        activeTab={activeTab}
        tier={copyTier}
        onSelectTab={setActiveTab}
        onToggleTier={handleToggleTier}
      />

      <PickerGrid
        items={items}
        selectedIndex={selectedIndex}
        onSelectItem={(item) => handleSelectItem(item, false)}
      />

      <PickerFooter
        onOpenManager={() => api?.openManager?.()}
      />
    </div>
  );
}
