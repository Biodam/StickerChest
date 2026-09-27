import React, { useState } from 'react';
import { X, Copy, Sparkles, Star, Check, Film, Play, Pause } from 'lucide-react';
import { StickerItem, ImageTier } from '../../../types/models';
import { getChestImageUrl } from '../../shared/image-url';
import { getAnimationTelemetry } from '../../shared/animation-helper';
import { MetadataForm } from './MetadataForm';

interface InspectorDrawerProps {
  item: StickerItem;
  onClose: () => void;
  onToggleFavorite: (itemId: string) => void;
  onTagWithGemini: (itemId: string) => void;
  onCopyItem: (itemId: string, tier: ImageTier) => void;
  onUpdateMetadata: (itemId: string, metadata: any) => void;
}

export const InspectorDrawer: React.FC<InspectorDrawerProps> = ({
  item,
  onClose,
  onToggleFavorite,
  onTagWithGemini,
  onCopyItem,
  onUpdateMetadata,
}) => {
  const [selectedTier, setSelectedTier] = useState<ImageTier>('sticker');
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  const telemetry = getAnimationTelemetry(item);

  const activePath =
    selectedTier === 'emoji'
      ? item.variants.emoji?.filePath || item.originalPath
      : selectedTier === 'raw'
      ? item.originalPath
      : item.variants.sticker?.filePath || item.originalPath;

  const previewPath =
    item.isAnimated && !isPlaying
      ? item.variants.thumb?.filePath || activePath
      : activePath;

  const previewUrl = getChestImageUrl(previewPath);

  const handleCopy = () => {
    onCopyItem(item.id, selectedTier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShowInFolder = () => {
    const api = window.stickerChest || window.stickerVault;
    if (api?.showItemInFolder) {
      api.showItemInFolder(item.originalPath);
    }
  };

  return (
    <aside className="w-80 border-l border-[#2c2e33] bg-[#1a1b1e] flex flex-col h-full overflow-y-auto select-none">
      {/* Header */}
      <div className="p-4 border-b border-[#2c2e33] flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-200 truncate">Metadata Inspector</h3>
        <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#25262b]">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Preview Section */}
      <div className="p-4 border-b border-[#2c2e33] flex flex-col items-center">
        <div className="relative w-48 h-48 rounded-xl bg-[#121316] border border-[#2c2e33] flex items-center justify-center p-2 mb-3 overflow-hidden shadow-inner group">
          <img src={previewUrl} alt={item.filename} className="max-w-full max-h-full object-contain" />

          {/* Animation Play/Pause Overlay */}
          {item.isAnimated && (
            <button
              onClick={() => setIsPlaying((prev) => !prev)}
              title={isPlaying ? 'Pause animation' : 'Play animation'}
              className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white/90 shadow transition-opacity"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
          )}
        </div>

        {/* Animation Telemetry Bar */}
        {item.isAnimated && (
          <div className="w-full mb-3 px-2.5 py-1.5 bg-purple-950/30 border border-purple-800/40 rounded-lg flex items-center justify-between text-[11px] text-purple-300">
            <div className="flex items-center space-x-1.5">
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold">{telemetry.formatLabel}</span>
            </div>
            <span>{telemetry.durationText}</span>
          </div>
        )}

        {/* Tier Tabs */}
        <div className="flex bg-[#121316] p-1 rounded-lg border border-[#2c2e33] text-xs w-full mb-3">
          {(['sticker', 'emoji', 'raw'] as ImageTier[]).map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`flex-1 py-1 rounded-md font-medium capitalize transition-colors ${
                selectedTier === tier ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Copy & Favorite Actions */}
        <div className="flex space-x-2 w-full">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : `Copy ${selectedTier}`}</span>
          </button>
          <button
            onClick={() => onToggleFavorite(item.id)}
            className={`p-2 rounded-lg border transition-colors ${
              item.usage.isFavorite
                ? 'bg-amber-400/10 border-amber-400/30 text-amber-400'
                : 'bg-[#25262b] border-[#2c2e33] text-gray-400 hover:text-amber-400'
            }`}
          >
            <Star className={`w-4 h-4 ${item.usage.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metadata & Tagging Section */}
      <div className="p-4 space-y-3.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">Sticker Metadata</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
              item.metadata?.aiStatus === 'completed'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {item.metadata?.aiStatus === 'completed' ? 'AI Tagged' : 'Manual'}
            </span>
          </div>
          <button
            onClick={() => onTagWithGemini(item.id)}
            className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-medium"
            title="Analyze using Gemini Vision AI"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Tag</span>
          </button>
        </div>

        {/* Embedded Metadata Form */}
        <MetadataForm item={item} onUpdateMetadata={onUpdateMetadata} />

        {/* Source File & File Details */}
        <div className="pt-2 border-t border-[#2c2e33] text-gray-400 text-[11px] space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-300">Source File</span>
            <button
              onClick={handleShowInFolder}
              className="text-blue-400 hover:text-blue-300 underline font-medium text-[10px]"
            >
              Show in Folder
            </button>
          </div>
          <p className="truncate text-gray-300 font-mono text-[10px] bg-[#121316] p-1.5 rounded border border-[#2c2e33]">
            {item.originalPath}
          </p>
          <div className="flex justify-between text-gray-500 text-[10px]">
            <span>{item.width} × {item.height} px ({item.ext.toUpperCase()})</span>
            <span>{(item.fileSizeBytes / 1024).toFixed(1)} KB</span>
          </div>
          <p className="text-gray-500 text-[10px]">Copied {item.usage.copyCount} times</p>
        </div>
      </div>
    </aside>
  );
};
