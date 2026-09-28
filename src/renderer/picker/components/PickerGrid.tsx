import React, { useEffect, useRef } from 'react';
import { Star, Film } from 'lucide-react';
import { StickerItem } from '../../../types/models';
import { AnimatedStickerImage } from '../../shared/AnimatedStickerImage';

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
    <div ref={containerRef} className="flex-1 overflow-y-auto p-4 scroll-smooth">
      <div className="grid grid-cols-4 gap-3.5">
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          const title = item.metadata?.character || item.filename;

          return (
            <button
              key={item.id}
              data-index={index}
              onClick={() => onSelectItem(item)}
              title={`${title} ${item.metadata?.feeling ? `(${item.metadata.feeling})` : ''}`}
              className={`group relative aspect-square rounded-xl p-3 flex items-center justify-center transition-all bg-[#25262b]/60 hover:bg-[#2c2e33] ${
                isSelected
                  ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#1a1b1e] bg-blue-600/20 shadow-lg shadow-blue-500/20'
                  : 'border border-[#2c2e33]/70 hover:border-[#3b3e45]'
              }`}
            >
              <AnimatedStickerImage
                item={item}
                isHovered={false}
                isSelected={isSelected}
                alt={title}
                className="max-w-full max-h-full object-contain pointer-events-none transition-transform group-hover:scale-105 duration-150"
              />

              {/* GIF indicator badge */}
              {item.isAnimated && (
                <div className="absolute top-1 left-1 bg-purple-600/80 rounded px-1 py-0.2 text-[9px] font-medium text-white flex items-center space-x-0.5 pointer-events-none shadow">
                  <Film className="w-2 h-2" />
                  <span>GIF</span>
                </div>
              )}

              {/* Favorite Star */}
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
