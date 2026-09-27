import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PickerSearch } from './components/PickerSearch';
import { PickerTabs } from './components/PickerTabs';
import { PickerGrid } from './components/PickerGrid';
import { PickerFooter } from './components/PickerFooter';
import { StickerItem, ImageTier } from '../../types/models';
import { PickerTab } from './keyboard-navigation';
import { usePickerKeyboard } from './hooks/usePickerKeyboard';

export default function PickerApp() {
  const [activeTab, setActiveTab] = useState<PickerTab>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<StickerItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copyTier, setCopyTier] = useState<ImageTier>('sticker');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = useCallback(async () => {
    if (!window.stickerVault?.searchItems) return;
    const res = await window.stickerVault.searchItems({
      query: searchQuery,
      tab: activeTab,
      limit: 48,
    });
    setItems(res.items);
    setSelectedIndex(0);
  }, [searchQuery, activeTab]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSelectItem = async (item: StickerItem, isShiftPressed: boolean = false) => {
    if (isShiftPressed) {
      // Shift+Enter: Copy only without auto-paste
      await window.stickerVault?.copyItemToClipboard?.(item.id, copyTier);
      await window.stickerVault?.hidePicker?.();
    } else {
      // Enter / Click: Default action (auto-paste workflow if enabled, or clipboard copy)
      if (window.stickerVault?.copyAndPasteItem) {
        await window.stickerVault.copyAndPasteItem(item.id, copyTier);
      } else if (window.stickerVault?.copyItemToClipboard) {
        await window.stickerVault.copyItemToClipboard(item.id, copyTier);
        await window.stickerVault?.hidePicker?.();
      }
    }
  };

  const handleToggleFavorite = async (item: StickerItem) => {
    if (!window.stickerVault?.toggleFavorite) return;
    await window.stickerVault.toggleFavorite(item.id);
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
    <div className="w-[420px] h-[520px] bg-[#1a1b1e]/95 backdrop-blur-xl border border-[#2c2e33] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#f1f3f5]">
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
        onOpenManager={() => window.stickerVault?.openManager?.()}
      />
    </div>
  );
}
