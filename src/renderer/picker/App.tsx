import React, { useState, useEffect, useCallback } from 'react';
import { PickerSearch } from './components/PickerSearch';
import { PickerTabs } from './components/PickerTabs';
import { PickerGrid } from './components/PickerGrid';
import { PickerFooter } from './components/PickerFooter';
import { StickerItem, ImageTier } from '../../types/models';

export default function PickerApp() {
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites' | 'all'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<StickerItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copyTier, setCopyTier] = useState<ImageTier>('sticker');

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

  const handleSelectItem = async (item: StickerItem) => {
    if (!window.stickerVault?.copyItemToClipboard) return;
    await window.stickerVault.copyItemToClipboard(item.id, copyTier);
    await window.stickerVault?.hidePicker?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      window.stickerVault?.hidePicker?.();
    } else if (e.key === 'ArrowRight') {
      setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
    } else if (e.key === 'ArrowLeft') {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) => Math.min(prev + 4, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => Math.max(prev - 4, 0));
    } else if (e.key === 'Enter') {
      if (items[selectedIndex]) {
        handleSelectItem(items[selectedIndex]);
      }
    }
  };

  const handleToggleTier = () => {
    setCopyTier((prev) => (prev === 'sticker' ? 'emoji' : 'sticker'));
  };

  return (
    <div className="w-[420px] h-[520px] bg-[#1a1b1e]/95 backdrop-blur-xl border border-[#2c2e33] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#f1f3f5]">
      <PickerSearch
        value={searchQuery}
        onChange={setSearchQuery}
        onClear={() => setSearchQuery('')}
        onKeyDown={handleKeyDown}
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
        onSelectItem={handleSelectItem}
      />

      <PickerFooter
        onOpenManager={() => window.stickerVault?.openManager?.()}
      />
    </div>
  );
}
