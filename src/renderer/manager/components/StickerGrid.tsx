import React, { useState, DragEvent } from 'react';
import { Image as ImageIcon, SearchX, UploadCloud } from 'lucide-react';
import { StickerItem } from '../../../types/models';
import { StickerCard } from './StickerCard';

interface StickerGridProps {
  items: StickerItem[];
  selectedItem: StickerItem | null;
  selectedItemIds?: Set<string>;
  searchQuery: string;
  onSelectItem: (item: StickerItem, e?: React.MouseEvent) => void;
  onToggleFavorite: (itemId: string, e: React.MouseEvent) => void;
  onOpenSettings: () => void;
  onDropFiles?: (filePaths: string[]) => void;
  gridSize?: number;
}

export const StickerGrid: React.FC<StickerGridProps> = ({
  items,
  selectedItem,
  selectedItemIds = new Set(),
  searchQuery,
  onSelectItem,
  onToggleFavorite,
  onOpenSettings,
  onDropFiles,
  gridSize = 160,
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only turn off if leaving the parent container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filePaths: string[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i] as File & { path?: string };
        if (file.path) {
          filePaths.push(file.path);
        }
      }
      if (filePaths.length > 0 && onDropFiles) {
        onDropFiles(filePaths);
      }
    }
  };

  if (items.length === 0) {
    if (searchQuery) {
      return (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="relative flex-1 flex flex-col items-center justify-center p-8 text-center select-none"
        >
          {isDraggingOver && <DropZoneOverlay />}
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
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative flex-1 flex flex-col items-center justify-center p-8 text-center select-none"
      >
        {isDraggingOver && <DropZoneOverlay />}
        <div className="w-16 h-16 rounded-2xl bg-[#1a1b1e] border border-[#2c2e33] flex items-center justify-center text-gray-500 mb-4 shadow-inner">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="font-semibold text-base text-gray-200 mb-1">Your Sticker Vault is Empty</h3>
        <p className="text-xs text-gray-400 max-w-sm mb-4">
          Drag and drop images or GIFs here, or select your folder in Settings to automatically index them.
        </p>
        <button
          onClick={onOpenSettings}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors"
        >
          Configure Folder &amp; API Key
        </button>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-1 overflow-y-auto p-4"
    >
      {isDraggingOver && <DropZoneOverlay />}
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${gridSize}px, 1fr))`,
        }}
      >
        {items.map((item) => (
          <StickerCard
            key={item.id}
            item={item}
            isSelected={selectedItem?.id === item.id}
            isMultiSelected={selectedItemIds.has(item.id)}
            isCompact={gridSize < 130}
            onSelect={(it, e) => onSelectItem(it, e)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
};

const DropZoneOverlay: React.FC = () => (
  <div className="absolute inset-0 z-40 bg-blue-600/20 backdrop-blur-sm border-2 border-dashed border-blue-400 rounded-xl flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
    <div className="p-4 rounded-full bg-blue-600/30 text-blue-300 mb-2 shadow-lg">
      <UploadCloud className="w-10 h-10 animate-bounce" />
    </div>
    <span className="text-sm font-bold text-white shadow">Drop images or GIFs to import</span>
    <span className="text-xs text-blue-200 mt-1">Automatic deduplication &amp; resizing</span>
  </div>
);
