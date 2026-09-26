import React, { useState } from 'react';
import { X, Copy, Sparkles, Star, Plus, Check } from 'lucide-react';
import { StickerItem, ImageTier } from '../../../types/models';
import { getVaultImageUrl } from '../../shared/image-url';

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
  const [newTagInput, setNewTagInput] = useState('');

  const previewPath =
    selectedTier === 'emoji'
      ? item.variants.emoji?.filePath || item.originalPath
      : selectedTier === 'raw'
      ? item.originalPath
      : item.variants.sticker?.filePath || item.originalPath;

  const previewUrl = getVaultImageUrl(previewPath);

  const handleCopy = () => {
    onCopyItem(item.id, selectedTier);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTagInput.trim().toLowerCase();
    if (!clean || item.tags.includes(clean)) return;

    onUpdateMetadata(item.id, { tags: [...item.tags, clean] });
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdateMetadata(item.id, { tags: item.tags.filter((t) => t !== tagToRemove) });
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
        <div className="w-48 h-48 rounded-xl bg-[#121316] border border-[#2c2e33] flex items-center justify-center p-2 mb-3 overflow-hidden shadow-inner">
          <img src={previewUrl} alt={item.filename} className="max-w-full max-h-full object-contain" />
        </div>

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

      {/* AI Metadata Details */}
      <div className="p-4 space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-400 uppercase tracking-wider text-[10px]">AI Metadata</span>
          <button
            onClick={() => onTagWithGemini(item.id)}
            className="flex items-center space-x-1 text-amber-400 hover:text-amber-300 font-medium"
          >
            <Sparkles className="w-3 h-3" />
            <span>Re-analyze</span>
          </button>
        </div>

        <div>
          <label className="text-gray-400 block mb-1">Character</label>
          <p className="font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33]">
            {item.metadata?.character || <span className="text-gray-500 italic">Unknown</span>}
          </p>
        </div>

        <div>
          <label className="text-gray-400 block mb-1">Source / Origin</label>
          <p className="font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33]">
            {item.metadata?.sourceOrigin || <span className="text-gray-500 italic">None</span>}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-gray-400 block mb-1">Action</label>
            <p className="font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33] truncate">
              {item.metadata?.action || <span className="text-gray-500 italic">None</span>}
            </p>
          </div>
          <div>
            <label className="text-gray-400 block mb-1">Feeling</label>
            <p className="font-medium text-gray-200 bg-[#25262b] px-2.5 py-1.5 rounded-lg border border-[#2c2e33] truncate">
              {item.metadata?.feeling || <span className="text-gray-500 italic">None</span>}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-gray-400 block mb-1.5">Tags & Keywords</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center space-x-1 bg-[#25262b] border border-[#2c2e33] px-2 py-0.5 rounded-md text-[11px] text-gray-300"
              >
                <span>#{tag}</span>
                <button onClick={() => handleRemoveTag(tag)} className="text-gray-500 hover:text-red-400 ml-0.5">
                  ×
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddTag} className="flex space-x-1.5">
            <input
              type="text"
              placeholder="Add tag..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              className="flex-1 px-2.5 py-1 bg-[#25262b] border border-[#2c2e33] rounded-md text-xs placeholder-gray-500 text-gray-200 focus:outline-none focus:border-blue-500"
            />
            <button type="submit" className="p-1 rounded-md bg-[#25262b] border border-[#2c2e33] text-gray-400 hover:text-white">
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Usage Stats */}
        <div className="pt-2 border-t border-[#2c2e33] text-gray-500 text-[11px] space-y-1">
          <p>Copied: {item.usage.copyCount} times</p>
          <p>Dimensions: {item.width} × {item.height} px</p>
          <p className="truncate">File: {item.filename}</p>
        </div>
      </div>
    </aside>
  );
};
