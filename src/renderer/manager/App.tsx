import React, { useState } from 'react';
import { Search, FolderSync, Settings, Image as ImageIcon, Sparkles, Star, Clock, Grid } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121316] text-[#f1f3f5]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#2c2e33] bg-[#1a1b1e] flex flex-col justify-between">
        <div>
          {/* Logo / Header */}
          <div className="p-4 border-b border-[#2c2e33] flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
              SV
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-wide">StickerVault</h1>
              <p className="text-xs text-gray-400">Database Manager</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-2 space-y-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'all'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>All Stickers</span>
            </button>
            <button
              onClick={() => setActiveTab('recent')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'recent'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Recent</span>
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Favorites</span>
            </button>
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#2c2e33] space-y-2">
          <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg bg-[#25262b] hover:bg-[#2c2e33] text-xs font-medium text-gray-300 transition-colors">
            <FolderSync className="w-4 h-4 text-blue-400" />
            <span>Sync Folder</span>
          </button>
          <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-[#25262b] text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Search Header */}
        <header className="h-14 border-b border-[#2c2e33] bg-[#1a1b1e] px-6 flex items-center justify-between">
          <div className="relative w-96">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by character, franchise, action, or feeling..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#25262b] border border-[#2c2e33] rounded-lg text-sm placeholder-gray-500 text-gray-200 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex items-center space-x-3 text-xs text-gray-400">
            <span className="flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gemini AI Auto-Tagger Ready</span>
            </span>
          </div>
        </header>

        {/* Grid Content Placeholder */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1b1e] border border-[#2c2e33] flex items-center justify-center text-gray-500 mb-4 shadow-inner">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-medium text-base text-gray-200 mb-1">StickerVault Library Ready</h3>
          <p className="text-sm text-gray-400 max-w-sm">
            Curate your local source images or GIFs. StickerVault will automatically resize, tag with Gemini AI, and index them.
          </p>
        </div>
      </main>
    </div>
  );
}
