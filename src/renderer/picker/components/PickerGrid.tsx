import React from 'react';
import { StickerItem } from '../../../types/models';
import { getVaultImageUrl } from '../../shared/image-url';

interface PickerGridProps {
  items: StickerItem[];
  selectedIndex: number;
  onSelectItem: (item: StickerItem) => void;
}

export const PickerGrid: React.FC<PickerGridProps> = ({
  items,
  selectedIndex,
  onSelectItem,
}) => {
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 select-none">
        <p className="text-xs">No stickers found in this view.</p>
        <p className="text-[11px] text-gray-600 mt-1">Open Manager to scan and tag stickers.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2.5">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item, index) => {
          const imageUrl = getVaultImageUrl(
            item.variants.thumb?.filePath ||
            item.variants.emoji?.filePath ||
            item.originalPath
          );
          const isSelected = index === selectedIndex;
          const title = item.metadata?.character || item.filename;

          return (
            <button
              key={item.id}
              onClick={() => onSelectItem(item)}
              title={`${title} ${item.metadata?.feeling ? `(${item.metadata.feeling})` : ''}`}
              className={`relative aspect-square rounded-xl p-2 flex items-center justify-center transition-all bg-[#25262b]/60 hover:bg-[#2c2e33] ${
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-600/20 shadow-md shadow-blue-500/30'
                  : 'border border-[#2c2e33]/60'
              }`}
            >
              <img
                src={imageUrl}
                alt={title}
                loading="lazy"
                className="max-w-full max-h-full object-contain pointer-events-none transition-transform hover:scale-110 duration-150"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
