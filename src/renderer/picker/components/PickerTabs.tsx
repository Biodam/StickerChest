import React from 'react';
import { Clock, Star, Grid } from 'lucide-react';
import { ImageTier } from '../../../types/models';
import { PickerTab } from '../keyboard-navigation';

interface PickerTabsProps {
  activeTab: PickerTab;
  tier: ImageTier;
  onSelectTab: (tab: PickerTab) => void;
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
          title="Recent (Ctrl+1)"
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'recent'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Recent</span>
          <span className="text-[10px] text-gray-500 opacity-70 ml-0.5">^1</span>
        </button>
        <button
          onClick={() => onSelectTab('favorites')}
          title="Favorites (Ctrl+2)"
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'favorites'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          <span>Favorites</span>
          <span className="text-[10px] text-gray-500 opacity-70 ml-0.5">^2</span>
        </button>
        <button
          onClick={() => onSelectTab('all')}
          title="All Stickers (Ctrl+3)"
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-gray-400 hover:bg-[#25262b] hover:text-gray-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>All</span>
          <span className="text-[10px] text-gray-500 opacity-70 ml-0.5">^3</span>
        </button>
      </div>

      {/* Copy Tier Toggle */}
      <button
        onClick={onToggleTier}
        title="Toggle Resolution (Ctrl+T)"
        className="px-2 py-0.5 rounded-md bg-[#25262b] hover:bg-[#2c2e33] text-[11px] font-semibold text-gray-300 border border-[#2c2e33] transition-colors flex items-center space-x-1"
      >
        <span>Copy: <span className="text-blue-400 uppercase">{tier}</span></span>
        <span className="text-[9px] text-gray-500 bg-[#1e1f23] px-1 py-0.2 rounded border border-[#2c2e33]">^T</span>
      </button>
    </div>
  );
};
