import React from 'react';
import { Star, Film } from 'lucide-react';
import { StickerItem } from '../../../types/models';
import { getVaultImageUrl } from '../../shared/image-url';

interface StickerCardProps {
  item: StickerItem;
  isSelected: boolean;
  onSelect: (item: StickerItem) => void;
  onToggleFavorite: (itemId: string, e: React.MouseEvent) => void;
}

export const StickerCard: React.FC<StickerCardProps> = ({
  item,
  isSelected,
  onSelect,
  onToggleFavorite,
}) => {
  const imageUrl = getVaultImageUrl(item.variants.thumb?.filePath || item.originalPath);
  const title = item.metadata?.character || item.filename;
  const subtitle = item.metadata?.feeling || item.metadata?.action || (item.tags[0] ? `#${item.tags[0]}` : null);

  return (
    <div
      onClick={() => onSelect(item)}
      className={`group relative rounded-xl p-2.5 transition-all cursor-pointer flex flex-col items-center select-none ${
        isSelected
          ? 'bg-blue-600/20 border-2 border-blue-500 shadow-lg shadow-blue-500/20'
          : 'bg-[#1a1b1e] border border-[#2c2e33] hover:border-[#3b82f6]/50 hover:bg-[#25262b]'
      }`}
    >
      {/* Favorite Button */}
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

      {/* Animated Badge */}
      {item.isAnimated && (
        <span className="absolute top-2 left-2 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-purple-600/80 text-[10px] text-white font-medium shadow">
          <Film className="w-2.5 h-2.5" />
          <span>GIF</span>
        </span>
      )}

      {/* Image Preview Box */}
      <div className="w-full aspect-square flex items-center justify-center p-2 rounded-lg bg-[#141517] overflow-hidden mb-2">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105 duration-200"
        />
      </div>

      {/* Text Info */}
      <div className="w-full text-center truncate">
        <h4 className="text-xs font-semibold text-gray-200 truncate">{title}</h4>
        {subtitle ? (
          <p className="text-[11px] text-gray-400 truncate mt-0.5">{subtitle}</p>
        ) : (
          <p className="text-[10px] text-gray-400 truncate mt-0.5">{item.width}×{item.height}</p>
        )}
      </div>
    </div>
  );
};
