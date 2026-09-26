import React from 'react';
import { Image as ImageIcon, SearchX } from 'lucide-react';
import { StickerItem } from '../../../types/models';
import { StickerCard } from './StickerCard';

interface StickerGridProps {
  items: StickerItem[];
  selectedItem: StickerItem | null;
  searchQuery: string;
  onSelectItem: (item: StickerItem) => void;
  onToggleFavorite: (itemId: string, e: React.MouseEvent) => void;
  onOpenSettings: () => void;
}

export const StickerGrid: React.FC<StickerGridProps> = ({
  items,
  selectedItem,
  searchQuery,
  onSelectItem,
  onToggleFavorite,
  onOpenSettings,
}) => {
  if (items.length === 0) {
    if (searchQuery) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
          <div className="w-14 h-14 rounded-2xl bg-[#1a1b1e] border border-[#2c2e33] flex items-center justify-center text-gray-500 mb-3">
            <SearchX className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-medium text-sm text-gray-200 mb-1">No stickers found</h3>
          <p className="text-xs text-gray-500 max-w-xs">
            No items matched "{searchQuery}". Try searching for another feeling, character, or action.
          </p>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-[#1a1b1e] border border-[#2c2e33] flex items-center justify-center text-gray-500 mb-4 shadow-inner">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-base text-gray-200 mb-1">Your Sticker Vault is Empty</h3>
        <p className="text-xs text-gray-400 max-w-sm mb-4">
          Select your curated folder of images or GIFs to automatically resize, tag with Gemini AI, and index them.
        </p>
        <button
          onClick={onOpenSettings}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors"
        >
          Configure Folder & API Key
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {items.map((item) => (
          <StickerCard
            key={item.id}
            item={item}
            isSelected={selectedItem?.id === item.id}
            onSelect={onSelectItem}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};
