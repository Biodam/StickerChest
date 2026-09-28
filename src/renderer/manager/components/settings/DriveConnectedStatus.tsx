import React from 'react';
import { CloudOff, RefreshCw, HardDrive } from 'lucide-react';
import { GoogleDriveAccountInfo } from '../../../../types/models';

interface DriveConnectedStatusProps {
  account: GoogleDriveAccountInfo;
  syncing: boolean;
  loading: boolean;
  onSyncNow: () => void;
  onDisconnect: () => void;
}

export const DriveConnectedStatus: React.FC<DriveConnectedStatusProps> = ({
  account,
  syncing,
  loading,
  onSyncNow,
  onDisconnect,
}) => {
  const formatBytes = (bytes?: number) => {
    if (!bytes) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  return (
    <div className="space-y-2 pt-1 border-t border-[#2c2e33]/50">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-gray-300 font-medium">{account.email || 'Google User'}</span>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={onSyncNow}
            disabled={syncing}
            className="px-2 py-1 bg-blue-600/80 hover:bg-blue-600 disabled:opacity-50 text-white rounded text-[10px] font-medium flex items-center space-x-1"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
          <button
            type="button"
            onClick={onDisconnect}
            disabled={loading || syncing}
            className="px-2 py-1 bg-[#25262b] hover:bg-red-950/50 hover:text-red-400 text-gray-400 rounded text-[10px] flex items-center space-x-1"
          >
            <CloudOff className="w-2.5 h-2.5" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      {account.storageTotalBytes && account.storageTotalBytes > 0 ? (
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] text-gray-500">
            <span className="flex items-center space-x-1">
              <HardDrive className="w-2.5 h-2.5" />
              <span>Google Drive Quota</span>
            </span>
            <span>{formatBytes(account.storageUsedBytes)} / {formatBytes(account.storageTotalBytes)}</span>
          </div>
          <div className="w-full bg-[#1a1b1e] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.round(((account.storageUsedBytes || 0) / account.storageTotalBytes) * 100))}%`,
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
};
