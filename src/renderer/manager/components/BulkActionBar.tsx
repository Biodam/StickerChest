import React, { useState } from 'react';
import { Star, Tag, Trash2, Sparkles, X, Check, Download } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkFavorite: (favorite: boolean) => void;
  onBulkAddTag: (tag: string) => void;
  onBulkAiTag: () => void;
  onBulkExport?: () => void;
  onBulkDelete: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkFavorite,
  onBulkAddTag,
  onBulkAiTag,
  onBulkExport,
  onBulkDelete,
}) => {
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (selectedCount < 2) return null;

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newTag.trim().toLowerCase();
    if (clean) {
      onBulkAddTag(clean);
      setNewTag('');
      setShowTagInput(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center space-x-3 px-4 py-2.5 bg-[#1e2025]/95 backdrop-blur-md border border-[#3b82f6]/40 rounded-2xl shadow-2xl shadow-black/60 text-white text-xs">
        {/* Count Badge */}
        <div className="flex items-center space-x-2 pr-3 border-r border-[#3b3d45]">
          <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[11px]">
            {selectedCount}
          </span>
          <span className="font-medium text-gray-300">Selected</span>
        </div>

        {/* Bulk Tag Input / Button */}
        {showTagInput ? (
          <form onSubmit={handleAddTagSubmit} className="flex items-center space-x-1.5">
            <input
              type="text"
              autoFocus
              placeholder="Tag to add..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              className="px-2 py-1 bg-[#141517] border border-blue-500/50 rounded-lg text-xs text-white focus:outline-none w-28"
            />
            <button
              type="submit"
              className="p-1 rounded bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowTagInput(false)}
              className="p-1 rounded text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowTagInput(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2e33] hover:bg-[#373a40] text-gray-200 transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-blue-400" />
            <span>Add Tag</span>
          </button>
        )}

        {/* Bulk Favorite */}
        <button
          onClick={() => onBulkFavorite(true)}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2e33] hover:bg-[#373a40] text-gray-200 transition-colors"
        >
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Favorite</span>
        </button>

        {/* Bulk AI Re-tag */}
        <button
          onClick={onBulkAiTag}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2e33] hover:bg-[#373a40] text-gray-200 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Tag</span>
        </button>

        {/* Bulk Export Pack */}
        {onBulkExport && (
          <button
            onClick={onBulkExport}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-[#2c2e33] hover:bg-[#373a40] text-gray-200 transition-colors"
            title="Export selected stickers to Telegram, Discord, or WhatsApp"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export Pack</span>
          </button>
        )}

        {/* Bulk Delete */}
        {showDeleteConfirm ? (
          <div className="flex items-center space-x-1.5 bg-rose-950/80 px-2 py-1 rounded-lg border border-rose-500/50">
            <span className="text-[11px] text-rose-300">Delete {selectedCount}?</span>
            <button
              onClick={() => {
                onBulkDelete();
                setShowDeleteConfirm(false);
              }}
              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold"
            >
              Yes
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-1.5 py-0.5 text-gray-400 hover:text-white text-[11px]"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Delete</span>
          </button>
        )}

        {/* Clear Selection */}
        <button
          onClick={onClearSelection}
          className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#2c2e33] transition-colors ml-1"
          title="Clear Selection (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
