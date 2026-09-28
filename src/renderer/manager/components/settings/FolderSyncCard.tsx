import React from 'react';
import { Folder, Cloud, RefreshCw, Sparkles } from 'lucide-react';

interface FolderSyncCardProps {
  folder: string;
  onBrowse: () => void;
  syncInterval: number;
  onChangeSyncInterval: (interval: number) => void;
  autoTag: boolean;
  onChangeAutoTag: (autoTag: boolean) => void;
}

export const FolderSyncCard: React.FC<FolderSyncCardProps> = ({
  folder,
  onBrowse,
  syncInterval,
  onChangeSyncInterval,
  autoTag,
  onChangeAutoTag,
}) => {
  return (
    <div className="space-y-4">
      {/* Curated Folder */}
      <div>
        <label className="text-gray-300 font-medium block mb-1.5 flex items-center space-x-1.5">
          <Folder className="w-3.5 h-3.5 text-blue-400" />
          <span>Curated Source Folder</span>
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            readOnly
            placeholder="No folder selected..."
            value={folder}
            className="flex-1 px-3 py-2 bg-[#121316] border border-[#2c2e33] rounded-lg text-xs text-gray-300 focus:outline-none truncate"
          />
          <button
            onClick={onBrowse}
            className="px-3 py-2 rounded-lg bg-[#25262b] hover:bg-[#2c2e33] text-gray-200 font-medium border border-[#2c2e33] transition-colors shrink-0"
          >
            Browse...
          </button>
        </div>
        {/* Cloud Drive badge */}
        <div className="flex flex-col space-y-1 mt-1.5 text-[11px] text-blue-300 bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
          <div className="flex items-center space-x-1.5 font-medium">
            <Cloud className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Multi-Device Sync Ready (Google Drive / OneDrive / iCloud)</span>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Sticker Chest saves database &amp; resized variants in <code className="text-blue-300">.stickerchest/</code> inside your selected folder.
          </p>
        </div>
      </div>

      {/* Sync Frequency & Auto-Tagging */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-gray-300 font-medium block mb-1.5 flex items-center space-x-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
            <span>Periodic Scan</span>
          </label>
          <select
            value={syncInterval}
            onChange={(e) => onChangeSyncInterval(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[#121316] border border-[#2c2e33] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-blue-500"
          >
            <option value={5}>Every 5 minutes</option>
            <option value={15}>Every 15 minutes (Default)</option>
            <option value={30}>Every 30 minutes</option>
            <option value={60}>Every 1 hour</option>
            <option value={0}>Manual only</option>
          </select>
        </div>

        <div>
          <label className="text-gray-300 font-medium block mb-1.5 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Auto-Tagging</span>
          </label>
          <label className="flex items-center space-x-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoTag}
              onChange={(e) => onChangeAutoTag(e.target.checked)}
              className="rounded border-[#2c2e33] text-blue-600 focus:ring-0 bg-[#121316] w-4 h-4"
            />
            <span className="text-gray-300">Auto-tag on import</span>
          </label>
        </div>
      </div>
    </div>
  );
};
