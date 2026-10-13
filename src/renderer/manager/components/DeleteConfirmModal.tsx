import React, { useEffect } from 'react';
import { X, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { StickerItem } from '../../../types/models';
import { getChestImageUrl } from '../../shared/image-url';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  items: StickerItem[];
  isDeleting?: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  items,
  isDeleting = false,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter' && !isDeleting) {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose, onConfirm]);

  if (!isOpen || items.length === 0) return null;

  const isSingle = items.length === 1;
  const singleItem = items[0];
  const title = isSingle ? 'Delete Sticker' : `Delete ${items.length} Stickers`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1b1e] border border-[#2c2e33] rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2c2e33] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/10">
              <Trash2 className="w-4 h-4 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">{title}</h2>
              <p className="text-xs text-gray-400">Confirm sticker removal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#25262b] transition-colors disabled:opacity-50"
            title="Cancel (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {isSingle ? (
            /* Single Sticker Preview */
            <div className="flex items-center space-x-3.5 p-3 bg-[#121316] border border-[#2c2e33] rounded-xl">
              <div className="w-16 h-16 rounded-lg bg-[#18191c] border border-[#2c2e33] flex items-center justify-center overflow-hidden p-1 flex-shrink-0">
                <img
                  src={getChestImageUrl(singleItem.variants.thumb?.filePath || singleItem.originalPath)}
                  alt={singleItem.filename}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-white truncate">
                  {singleItem.metadata?.character || singleItem.filename}
                </h4>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {singleItem.metadata?.sourceOrigin || singleItem.filename}
                </p>
                <div className="flex items-center space-x-2 text-[10px] text-gray-500 mt-1">
                  <span>{singleItem.width} × {singleItem.height} px</span>
                  <span>•</span>
                  <span>{(singleItem.fileSizeBytes / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>
          ) : (
            /* Multi-Sticker Collage Preview */
            <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between text-xs text-gray-300 font-medium">
                <span>Selected Items</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px]">
                  {items.length} stickers
                </span>
              </div>
              <div className="flex items-center space-x-2 overflow-hidden py-1">
                {items.slice(0, 5).map((it) => (
                  <div
                    key={it.id}
                    className="w-12 h-12 rounded-lg bg-[#18191c] border border-[#2c2e33] flex items-center justify-center overflow-hidden p-0.5 flex-shrink-0"
                    title={it.metadata?.character || it.filename}
                  >
                    <img
                      src={getChestImageUrl(it.variants.thumb?.filePath || it.originalPath)}
                      alt={it.filename}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
                {items.length > 5 && (
                  <div className="w-12 h-12 rounded-lg bg-[#25262b] border border-[#2c2e33] flex items-center justify-center text-xs text-gray-400 font-semibold flex-shrink-0">
                    +{items.length - 5}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Warning Message */}
          <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              {isSingle
                ? 'Are you sure you want to delete this sticker from your vault? This will remove its metadata, tags, and generated variants.'
                : `Are you sure you want to delete these ${items.length} stickers from your vault? This action cannot be undone.`}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#2c2e33] bg-[#141517] flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs font-medium text-gray-300 hover:text-white bg-[#25262b] hover:bg-[#2c2e33] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25 transition-all disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            <span>{isDeleting ? 'Deleting...' : isSingle ? 'Delete Sticker' : `Delete (${items.length})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
