import React from 'react';
import { Search, Sparkles, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  totalItems: number;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  selectedFranchise?: string | null;
  selectedCharacter?: string | null;
  selectedTag?: string | null;
  onClearFranchise?: () => void;
  onClearCharacter?: () => void;
  onClearTag?: () => void;
  modelName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  totalItems,
  onSearchChange,
  onClearSearch,
  selectedFranchise,
  selectedCharacter,
  selectedTag,
  onClearFranchise,
  onClearCharacter,
  onClearTag,
  modelName = 'gemini-3.8-flash',
}) => {
  const hasFilterChips = Boolean(selectedFranchise || selectedCharacter || selectedTag);

  return (
    <header className="border-b border-[#2c2e33] bg-[#1a1b1e] px-6 py-2.5 flex flex-col justify-center space-y-2 select-none">
      <div className="flex items-center justify-between">
        {/* Search Input Bar */}
        <div className="relative w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by character, franchise, action, or feeling..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-[#25262b] border border-[#2c2e33] rounded-lg text-sm placeholder-gray-500 text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Stats & AI status */}
        <div className="flex items-center space-x-3 text-xs text-gray-400">
          <span className="bg-[#25262b] px-2.5 py-1 rounded-md text-gray-300 font-mono">
            {totalItems} {totalItems === 1 ? 'sticker' : 'stickers'}
          </span>
          <span className="flex items-center space-x-1.5 text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="capitalize">{modelName} Vision</span>
          </span>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasFilterChips && (
        <div className="flex items-center space-x-2 text-xs pt-0.5">
          <span className="text-gray-500 text-[11px]">Filtered by:</span>
          {selectedFranchise && (
            <span className="inline-flex items-center space-x-1 bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
              <span>Franchise: <strong>{selectedFranchise}</strong></span>
              <button onClick={onClearFranchise} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedCharacter && (
            <span className="inline-flex items-center space-x-1 bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
              <span>Character: <strong>{selectedCharacter}</strong></span>
              <button onClick={onClearCharacter} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedTag && (
            <span className="inline-flex items-center space-x-1 bg-purple-600/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
              <span>Tag: <strong>#{selectedTag}</strong></span>
              <button onClick={onClearTag} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </header>
  );
};
