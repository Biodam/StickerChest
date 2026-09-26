import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, Star, Grid, X } from 'lucide-react';

export default function PickerApp() {
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites' | 'all'>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.stickerVault?.hidePicker?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-[420px] h-[520px] bg-[#1a1b1e]/95 backdrop-blur-xl border border-[#2c2e33] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#f1f3f5]">
      {/* Top Search & Drag Region */}
      <div className="p-3 border-b border-[#2c2e33] flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type reaction, character, mood..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-[#25262b] border border-[#2c2e33] rounded-xl text-sm placeholder-gray-500 text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="px-3 pt-2 pb-1 border-b border-[#2c2e33] flex space-x-1">
        <button
          onClick={() => setActiveTab('recent')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'recent'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Recent</span>
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'favorites'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Favorites</span>
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>All</span>
        </button>
      </div>

      {/* Grid List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col items-center justify-center text-center text-gray-500">
        <p className="text-xs">No stickers yet. Curate your collection in Manager!</p>
      </div>

      {/* Footer shortcut hint */}
      <div className="h-7 border-t border-[#2c2e33] px-3 flex items-center justify-between text-[11px] text-gray-500 bg-[#141517]">
        <span>Press <kbd className="px-1 py-0.5 rounded bg-[#25262b] border border-[#2c2e33] text-gray-400 font-mono">Esc</kbd> to dismiss</span>
        <span>Click sticker to copy</span>
      </div>
    </div>
  );
}
