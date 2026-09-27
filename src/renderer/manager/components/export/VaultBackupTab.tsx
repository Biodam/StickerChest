import React from 'react';

interface VaultBackupTabProps {
  totalStickers: number;
}

export const VaultBackupTab: React.FC<VaultBackupTabProps> = ({ totalStickers }) => {
  return (
    <div className="space-y-3">
      <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl text-gray-300 space-y-1.5">
        <span className="font-semibold text-white">Full Vault Migration Archive</span>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Creates a single portable <code className="text-blue-300">.stickervault</code> archive containing all original stickers, multi-tier WebP variants, SQLite database snapshot, and a JSON manifest.
        </p>
        <div className="text-[11px] text-gray-400 pt-1">
          Stickers to archive: <strong className="text-white">{totalStickers}</strong>
        </div>
      </div>
    </div>
  );
};
