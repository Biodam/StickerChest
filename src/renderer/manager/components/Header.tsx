import React from 'react';
import { Search, Sparkles, X } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  totalItems: number;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  totalItems,
  onSearchChange,
  onClearSearch,
}) => {
  return (
    <header className="h-14 border-b border-[#2c2e33] bg-[#1a1b1e] px-6 flex items-center justify-between select-none">
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
      <div className="flex items-center space-x-4 text-xs text-gray-400">
        <span className="bg-[#25262b] px-2.5 py-1 rounded-md text-gray-300 font-mono">
          {totalItems} {totalItems === 1 ? 'sticker' : 'stickers'}
        </span>
        <span className="flex items-center space-x-1.5 text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Gemini 2.5 Flash Vision</span>
        </span>
      </div>
    </header>
  );
};
