import React from 'react';
import { Grid, Clock, Star, Film, FolderSync, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: 'all' | 'recent' | 'favorites';
  isAnimatedOnly: boolean;
  onSelectTab: (tab: 'all' | 'recent' | 'favorites') => void;
  onToggleAnimatedOnly: () => void;
  onSyncFolder: () => void;
  onOpenSettings: () => void;
  isScanning: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  isAnimatedOnly,
  onSelectTab,
  onToggleAnimatedOnly,
  onSyncFolder,
  onOpenSettings,
  isScanning,
}) => {
  return (
    <aside className="w-60 border-r border-[#2c2e33] bg-[#1a1b1e] flex flex-col justify-between select-none">
      <div>
        {/* App Branding */}
        <div className="p-4 border-b border-[#2c2e33] flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 text-sm">
            SV
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-wide text-white">StickerVault</h1>
            <p className="text-[11px] text-gray-400">Database Manager</p>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="p-2 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Library
          </div>
          <button
            onClick={() => onSelectTab('all')}
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
            onClick={() => onSelectTab('recent')}
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
            onClick={() => onSelectTab('favorites')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Favorites</span>
          </button>

          <div className="pt-2 px-3 py-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Filters
          </div>
          <button
            onClick={onToggleAnimatedOnly}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isAnimatedOnly
                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Film className="w-4 h-4" />
              <span>Animated GIFs</span>
            </div>
            {isAnimatedOnly && (
              <span className="w-2 h-2 rounded-full bg-purple-400" />
            )}
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-3 border-t border-[#2c2e33] space-y-2">
        <button
          onClick={onSyncFolder}
          disabled={isScanning}
          className={`w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
            isScanning
              ? 'bg-blue-600/30 text-blue-300 cursor-not-allowed'
              : 'bg-[#25262b] hover:bg-[#2c2e33] text-gray-300'
          }`}
        >
          <FolderSync className={`w-4 h-4 text-blue-400 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Sync Folder'}</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg hover:bg-[#25262b] text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Settings & API</span>
        </button>
      </div>
    </aside>
  );
};
