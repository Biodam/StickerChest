import React, { useState } from 'react';
import { Star, Film, ShieldAlert, Check } from 'lucide-react';
import { StickerItem } from '../../../types/models';
import { AnimatedStickerImage } from '../../shared/AnimatedStickerImage';

interface StickerCardProps {
  item: StickerItem;
  isSelected: boolean;
  isMultiSelected?: boolean;
  onSelect: (item: StickerItem, e: React.MouseEvent) => void;
  onToggleFavorite: (itemId: string, e: React.MouseEvent) => void;
}

export const StickerCard: React.FC<StickerCardProps> = ({
  item,
  isSelected,
  isMultiSelected = false,
  onSelect,
  onToggleFavorite,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const title = item.metadata?.character || item.filename;
  const subtitle = item.metadata?.feeling || item.metadata?.action || (item.tags[0] ? `#${item.tags[0]}` : null);
  const isNsfw = item.customAttributes?.nsfw === 'true';
  const rating = item.customAttributes?.rating;

  return (
    <div
      onClick={(e) => onSelect(item, e)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-xl p-2.5 transition-all cursor-pointer flex flex-col items-center select-none ${
        isMultiSelected
          ? 'bg-blue-600/30 border-2 border-blue-400 shadow-lg shadow-blue-500/30'
          : isSelected
          ? 'bg-blue-600/20 border-2 border-blue-500 shadow-lg shadow-blue-500/20'
          : 'bg-[#1a1b1e] border border-[#2c2e33] hover:border-[#3b82f6]/50 hover:bg-[#25262b]'
      }`}
    >
      {/* Top Left: Multi-select Checkbox or GIF Badge */}
      <div className="absolute top-2 left-2 flex items-center space-x-1 z-10">
        {isMultiSelected && (
          <span className="w-5 h-5 rounded-md bg-blue-500 flex items-center justify-center text-white shadow">
            <Check className="w-3.5 h-3.5" />
          </span>
        )}
        {item.isAnimated && (
          <span className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-purple-600/80 text-[10px] text-white font-medium shadow">
            <Film className="w-2.5 h-2.5" />
            <span>GIF</span>
          </span>
        )}
      </div>

      {/* Top Right: Favorite Button */}
      <button
        onClick={(e) => onToggleFavorite(item.id, e)}
        className={`absolute top-2 right-2 p-1.5 rounded-lg transition-colors z-10 ${
          item.usage.isFavorite
            ? 'text-amber-400 bg-amber-400/10'
            : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-amber-400 bg-[#121316]/70'
        }`}
      >
        <Star className={`w-3.5 h-3.5 ${item.usage.isFavorite ? 'fill-amber-400' : ''}`} />
      </button>

      {/* Image Preview Box with Viewport & Hover Awareness */}
      <div className="relative w-full aspect-square flex items-center justify-center p-2 rounded-lg bg-[#141517] overflow-hidden mb-2">
        <AnimatedStickerImage
          item={item}
          isHovered={isHovered}
          isSelected={isSelected}
          alt={title}
          className={`max-w-full max-h-full object-contain transition-all duration-200 group-hover:scale-105 ${
            isNsfw ? 'filter blur-md group-hover:blur-none' : ''
          }`}
        />
        {isNsfw && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity">
            <div className="flex items-center space-x-1 px-2 py-1 rounded bg-black/75 border border-rose-500/40 text-rose-300 text-[10px] font-medium">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              <span>Sensitive</span>
            </div>
          </div>
        )}
      </div>

      {/* Text Info */}
      <div className="w-full text-center truncate">
        <div className="flex items-center justify-center space-x-1">
          <h4 className="text-xs font-semibold text-gray-200 truncate">{title}</h4>
          {rating && (
            <span className="text-[10px] text-amber-400 font-semibold flex items-center">
              ★{rating}
            </span>
          )}
        </div>
        {subtitle ? (
          <p className="text-[11px] text-gray-400 truncate mt-0.5">{subtitle}</p>
        ) : (
          <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.width}×{item.height}</p>
        )}
      </div>
    </div>
  );
};
