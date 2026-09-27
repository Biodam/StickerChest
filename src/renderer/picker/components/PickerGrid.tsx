import React, { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { StickerItem } from '../../../types/models';
import { getChestImageUrl } from '../../shared/image-url';

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
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll selected item into view
  useEffect(() => {
    if (!containerRef.current) return;
    const selectedElement = containerRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    ) as HTMLElement | null;

    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [selectedIndex]);

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-gray-500 select-none">
        <p className="text-xs">No stickers found in this view.</p>
        <p className="text-[11px] text-gray-600 mt-1">Open Manager to scan and tag stickers.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-2.5 scroll-smooth">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item, index) => {
          const imageUrl = getChestImageUrl(
            item.variants.thumb?.filePath ||
            item.variants.emoji?.filePath ||
            item.originalPath
          );
          const isSelected = index === selectedIndex;
          const title = item.metadata?.character || item.filename;

          return (
            <button
              key={item.id}
              data-index={index}
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
              {item.usage?.isFavorite && (
                <div className="absolute top-1 right-1 text-yellow-400 bg-black/60 rounded-full p-0.5 pointer-events-none">
                  <Star className="w-2.5 h-2.5 fill-current" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
