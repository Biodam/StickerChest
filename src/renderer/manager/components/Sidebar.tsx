import React from 'react';
import { Grid, Clock, Star, Film, FolderSync, Settings, Tv, User, Tag, FilterX, Download, UploadCloud, Info, Loader2 } from 'lucide-react';
import { LibraryFacets } from '../../../types/models';
import { FacetFilterGroup } from './FacetFilterGroup';

interface SidebarProps {
  activeTab: 'all' | 'recent' | 'favorites';
  isAnimatedOnly: boolean;
  onSelectTab: (tab: 'all' | 'recent' | 'favorites') => void;
  onToggleAnimatedOnly: () => void;
  onSyncFolder: () => void;
  onOpenSettings: () => void;
  onOpenAbout?: () => void;
  onOpenExport?: () => void;
  onOpenImport?: () => void;
  isScanning: boolean;
  facets: LibraryFacets;
  selectedFranchise: string | null;
  selectedCharacter: string | null;
  selectedTag: string | null;
  onSelectFranchise: (franchise: string | null) => void;
  onSelectCharacter: (character: string | null) => void;
  onSelectTag: (tag: string | null) => void;
  onClearAllFilters: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  isAnimatedOnly,
  onSelectTab,
  onToggleAnimatedOnly,
  onSyncFolder,
  onOpenSettings,
  onOpenAbout,
  onOpenExport,
  onOpenImport,
  isScanning,
  facets,
  selectedFranchise,
  selectedCharacter,
  selectedTag,
  onSelectFranchise,
  onSelectCharacter,
  onSelectTag,
  onClearAllFilters,
}) => {
  const hasActiveFacet = Boolean(selectedFranchise || selectedCharacter || selectedTag);

  return (
    <aside className="w-64 border-r border-[#2c2e33] bg-[#1a1b1e] flex flex-col justify-between select-none h-full overflow-hidden">
      {/* App Branding */}
      <div className="p-4 border-b border-[#2c2e33] flex items-center space-x-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30 text-sm">
          SC
        </div>
        <div>
          <h1 className="font-semibold text-sm tracking-wide text-white">Sticker Chest</h1>
          <p className="text-[11px] text-gray-400">Database Manager</p>
        </div>
      </div>

      {/* Scrollable Navigation & Filter Content */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
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
          Format
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

        {/* Clear Filters Indicator */}
        {hasActiveFacet && (
          <div className="pt-2 px-1">
            <button
              onClick={onClearAllFilters}
              className="w-full flex items-center justify-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-medium transition-colors"
            >
              <FilterX className="w-3.5 h-3.5 text-red-400" />
              <span>Clear Filter Attributes</span>
            </button>
          </div>
        )}

        {/* Dynamic Facet Filters */}
        <FacetFilterGroup
          title="Franchises"
          icon={Tv}
          items={facets.franchises}
          selectedItem={selectedFranchise}
          onSelectItem={onSelectFranchise}
          defaultExpanded={true}
        />

        <FacetFilterGroup
          title="Characters"
          icon={User}
          items={facets.characters}
          selectedItem={selectedCharacter}
          onSelectItem={onSelectCharacter}
          defaultExpanded={true}
        />

        <FacetFilterGroup
          title="Tags"
          icon={Tag}
          items={facets.tags}
          selectedItem={selectedTag}
          onSelectItem={onSelectTag}
          defaultExpanded={true}
          prefix="#"
          maxInitial={8}
        />
      </div>

      {/* Action Footer */}
      <div className="p-3 border-t border-[#2c2e33] space-y-1.5 flex-shrink-0">
        <button
          onClick={onSyncFolder}
          disabled={isScanning}
          className={`w-full flex items-center justify-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isScanning
              ? 'bg-blue-600/30 text-blue-300 cursor-not-allowed'
              : 'bg-[#25262b] hover:bg-[#2c2e33] text-gray-300'
          }`}
        >
          {isScanning ? (
            <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          ) : (
            <FolderSync className="w-3.5 h-3.5 text-blue-400" />
          )}
          <span>{isScanning ? 'Scanning...' : 'Sync Folder'}</span>
        </button>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onOpenExport}
            className="flex items-center justify-center space-x-1 px-2 py-1.5 rounded-lg bg-[#25262b] hover:bg-[#2c2e33] text-xs font-medium text-gray-300 transition-colors"
            title="Export vault backup or sticker packs"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Export</span>
          </button>
          <button
            onClick={onOpenImport}
            className="flex items-center justify-center space-x-1 px-2 py-1.5 rounded-lg bg-[#25262b] hover:bg-[#2c2e33] text-xs font-medium text-gray-300 transition-colors"
            title="Restore vault archive"
          >
            <UploadCloud className="w-3.5 h-3.5 text-emerald-400" />
            <span>Restore</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={onOpenSettings}
            className="flex items-center justify-center space-x-1.5 px-2 py-1.5 rounded-lg hover:bg-[#25262b] text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
          <button
            onClick={onOpenAbout}
            className="flex items-center justify-center space-x-1.5 px-2 py-1.5 rounded-lg hover:bg-[#25262b] text-xs font-medium text-gray-400 hover:text-gray-200 transition-colors"
            title="About Sticker Chest"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
