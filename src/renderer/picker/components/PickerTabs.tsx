import React from 'react';
import { Clock, Star, Grid } from 'lucide-react';
import { ImageTier } from '../../../types/models';

interface PickerTabsProps {
  activeTab: 'recent' | 'favorites' | 'all';
  tier: ImageTier;
  onSelectTab: (tab: 'recent' | 'favorites' | 'all') => void;
  onToggleTier: () => void;
}

export const PickerTabs: React.FC<PickerTabsProps> = ({
  activeTab,
  tier,
  onSelectTab,
  onToggleTier,
}) => {
  return (
    <div className="px-3 py-1.5 border-b border-[#2c2e33] flex items-center justify-between select-none">
      {/* Tabs */}
      <div className="flex space-x-1">
        <button
          onClick={() => onSelectTab('recent')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'recent'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Recent</span>
        </button>
        <button
          onClick={() => onSelectTab('favorites')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'favorites'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Favorites</span>
        </button>
        <button
          onClick={() => onSelectTab('all')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>All</span>
        </button>
      </div>

      {/* Copy Tier Toggle */}
      <button
        onClick={onToggleTier}
        className="px-2 py-0.5 rounded-md bg-[#25262b] hover:bg-[#2c2e33] text-[11px] font-semibold text-gray-300 border border-[#2c2e33] transition-colors"
      >
        Copy as: <span className="text-blue-400 uppercase">{tier}</span>
      </button>
    </div>
  );
};
