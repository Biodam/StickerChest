import React, { useEffect, useState } from 'react';
import { CloudDownload, RefreshCw, FileJson } from 'lucide-react';
import { SyncProgress } from '../../../../types/models';

interface PublicDriveCardProps {
  folderUrl: string;
  onChangeFolderUrl: (val: string) => void;
  apiKey: string;
  onChangeApiKey: (val: string) => void;
  autoSync: boolean;
  onChangeAutoSync: (val: boolean) => void;
}

type Status = { text: string; isError?: boolean } | null;

export const PublicDriveCard: React.FC<PublicDriveCardProps> = ({
  folderUrl, onChangeFolderUrl, apiKey, onChangeApiKey, autoSync, onChangeAutoSync,
}) => {
  const [status, setStatus] = useState<Status>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const api = window.stickerChest;
    if (!api?.onSyncProgress) return;
    return api.onSyncProgress((p: SyncProgress) => {
      if (p.state === 'syncing') setStatus({ text: p.currentStep || 'Syncing...' });
      if (p.state === 'synced') setStatus({ text: p.currentStep || 'Sync complete' });
      if (p.state === 'error') setStatus({ text: p.errorMessage || 'Sync failed', isError: true });
    });
  }, []);

  const run = async (fn: () => Promise<Status>): Promise<void> => {
    setBusy(true);
    try {
      setStatus(await fn());
    } catch (err: any) {
      setStatus({ text: err.message || 'Unexpected error', isError: true });
    } finally {
      setBusy(false);
    }
  };

  const handleTest = (): Promise<void> => run(async () => {
    const res = await window.stickerChest.syncValidate(folderUrl, apiKey);
    return res.success
      ? { text: `Connected. Found ${res.fileCount} item(s) in the folder.` }
      : { text: res.error || 'Validation failed', isError: true };
  });

  const handleSyncNow = (): Promise<void> => run(async () => {
    // Persist-free: main process reads saved settings, so remind the user to save first.
    const res = await window.stickerChest.syncTriggerNow();
    return res.success
      ? { text: `Downloaded ${res.downloaded ?? 0} new file(s).` }
      : { text: res.error || 'Sync failed', isError: true };
  });

  const handleExport = (): Promise<void> => run(async () => {
    const res = await window.stickerChest.syncExportMetadata();
    return res.success
      ? { text: `Exported ${res.count} item(s) to ${res.path}. Upload it to your Drive folder to share tags.` }
      : { text: res.error || 'Export failed', isError: true };
  });

  const inputClass = 'w-full px-3 py-2 rounded-lg bg-[#121316] border border-[#2c2e33] text-gray-200 text-xs focus:outline-none focus:border-blue-500';

  return (
    <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl space-y-2.5">
      <div className="flex items-center space-x-1.5 font-semibold text-gray-200">
        <CloudDownload className="w-3.5 h-3.5 text-blue-400" />
        <span>Public Google Drive Folder</span>
      </div>
      <p className="text-[10px] text-gray-400 leading-relaxed">
        Paste a folder link shared as "Anyone with the link". New images are downloaded into your local sticker folder (one-way, no login).
      </p>
      <input className={inputClass} placeholder="https://drive.google.com/drive/folders/..." value={folderUrl} onChange={(e) => onChangeFolderUrl(e.target.value)} />
      <input className={inputClass} type="password" placeholder="Google API key (Drive API enabled)" value={apiKey} onChange={(e) => onChangeApiKey(e.target.value)} />

      <label className="flex items-center space-x-2 cursor-pointer">
        <input type="checkbox" checked={autoSync} onChange={(e) => onChangeAutoSync(e.target.checked)} />
        <span className="text-[11px] text-gray-300">Auto-sync on startup and every sync interval</span>
      </label>

      <div className="flex flex-wrap gap-2">
        <button disabled={busy} onClick={handleTest} className="px-3 py-1.5 rounded-lg bg-[#25262b] hover:bg-[#2c2e33] text-gray-200 border border-[#2c2e33] disabled:opacity-50">
          Test link
        </button>
        <button disabled={busy} onClick={handleSyncNow} className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1 disabled:opacity-50">
          <RefreshCw className={`w-3 h-3 ${busy ? 'animate-spin' : ''}`} /><span>Sync now (saved settings)</span>
        </button>
        <button disabled={busy} onClick={handleExport} className="px-3 py-1.5 rounded-lg bg-[#25262b] hover:bg-[#2c2e33] text-gray-200 border border-[#2c2e33] flex items-center space-x-1 disabled:opacity-50">
          <FileJson className="w-3 h-3" /><span>Export metadata</span>
        </button>
      </div>
      {status && <p className={`text-[11px] ${status.isError ? 'text-red-400' : 'text-green-400'}`}>{status.text}</p>}
    </div>
  );
};
