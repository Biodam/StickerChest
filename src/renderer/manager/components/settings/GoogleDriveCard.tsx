import React, { useState, useEffect } from 'react';
import { Cloud, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { GoogleDriveAccountInfo, SyncProgress } from '../../../../types/models';
import { DriveConnectedStatus } from './DriveConnectedStatus';

interface GoogleDriveCardProps {
  autoSync: boolean;
  onChangeAutoSync: (val: boolean) => void;
  clientId: string;
  onChangeClientId: (val: string) => void;
}

export const GoogleDriveCard: React.FC<GoogleDriveCardProps> = ({
  autoSync,
  onChangeAutoSync,
  clientId,
  onChangeClientId,
}) => {
  const [account, setAccount] = useState<GoogleDriveAccountInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fetchAccount = async () => {
    try {
      const info = await window.stickerChest.syncGetAccountInfo();
      setAccount(info);
    } catch (err) {
      console.error('Failed to load drive account info:', err);
    }
  };

  useEffect(() => {
    fetchAccount();
    const unsub = window.stickerChest.onSyncProgress((prog: SyncProgress) => {
      if (prog.state === 'syncing' || prog.state === 'authenticating' || prog.state === 'downloading') {
        setSyncing(true);
        setStatusMsg({ text: prog.currentStep || 'Synchronizing with Google Drive...' });
      } else if (prog.state === 'synced') {
        setSyncing(false);
        setStatusMsg({ text: 'Sync completed successfully!' });
        fetchAccount();
      } else if (prog.state === 'error') {
        setSyncing(false);
        setStatusMsg({ text: prog.errorMessage || 'Sync failed', isError: true });
      } else {
        setSyncing(false);
      }
    });
    return () => unsub();
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    setStatusMsg({ text: 'Opening Google login in browser...' });
    try {
      const res = await window.stickerChest.syncConnectGoogleDrive(clientId);
      if (!res.success) {
        setStatusMsg({ text: res.error || 'Connection failed', isError: true });
      } else {
        setStatusMsg({ text: 'Connected successfully!' });
        await fetchAccount();
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Error connecting to Google Drive', isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect from Google Drive? Your local library will remain intact.')) return;
    setLoading(true);
    try {
      await window.stickerChest.syncDisconnectGoogleDrive();
      setAccount(null);
      setStatusMsg({ text: 'Disconnected from Google Drive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async () => {
    setSyncing(true);
    setStatusMsg({ text: 'Starting synchronization...' });
    try {
      const res = await window.stickerChest.syncTriggerNow();
      if (!res.success) {
        setStatusMsg({ text: res.error || 'Sync failed', isError: true });
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'Sync error', isError: true });
    }
  };

  return (
    <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-gray-200 font-medium flex items-center space-x-1.5">
          <Cloud className={`w-3.5 h-3.5 ${account?.connected ? 'text-green-400' : 'text-blue-400'}`} />
          <span>Google Drive Cloud Sync</span>
        </label>
        {account?.connected && (
          <span className="flex items-center space-x-1 text-[10px] text-green-400 bg-green-950/60 px-2 py-0.5 rounded-full border border-green-800/40">
            <CheckCircle2 className="w-3 h-3" />
            <span>Connected</span>
          </span>
        )}
      </div>

      <p className="text-[10px] text-gray-400 leading-normal">
        Sync your stickers and database snapshots directly to your private Google Drive AppData folder across your devices.
      </p>

      {account?.connected ? (
        <DriveConnectedStatus
          account={account}
          syncing={syncing}
          loading={loading}
          onSyncNow={handleSyncNow}
          onDisconnect={handleDisconnect}
        />
      ) : (
        <div className="pt-1">
          <button
            type="button"
            onClick={handleConnect}
            disabled={loading}
            className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>{loading ? 'Authenticating...' : 'Connect with Google Drive'}</span>
          </button>
        </div>
      )}

      {statusMsg && (
        <div className={`p-2 rounded-lg text-[10px] flex items-start space-x-1.5 ${statusMsg.isError ? 'bg-red-950/40 border border-red-900/50 text-red-300' : 'bg-blue-950/30 border border-blue-900/40 text-blue-300'}`}>
          {statusMsg.isError ? <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" /> : <RefreshCw className="w-3 h-3 mt-0.5 shrink-0" />}
          <span className="break-all">{statusMsg.text}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoSync}
            onChange={(e) => onChangeAutoSync(e.target.checked)}
            className="rounded border-[#2c2e33] text-blue-600 focus:ring-0 bg-[#1a1b1e] w-3.5 h-3.5"
          />
          <span className="text-[11px] text-gray-300">Auto-sync library updates in background</span>
        </label>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-[10px] text-gray-400 hover:text-gray-200 underline"
        >
          {showAdvanced ? 'Hide OAuth options' : 'Custom OAuth App'}
        </button>
      </div>

      {showAdvanced && (
        <div className="p-2 bg-[#1a1b1e] rounded-lg border border-[#2c2e33] space-y-1">
          <span className="text-[9px] text-gray-400">Custom Google Cloud OAuth Client ID (optional):</span>
          <input
            type="text"
            value={clientId}
            onChange={(e) => onChangeClientId(e.target.value)}
            placeholder="123456789-abc.apps.googleusercontent.com"
            className="w-full px-2 py-1 bg-[#121316] border border-[#2c2e33] rounded text-[10px] text-gray-200 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      )}
    </div>
  );
};
