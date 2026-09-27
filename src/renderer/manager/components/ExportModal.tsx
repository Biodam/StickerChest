import React, { useState, useEffect } from 'react';
import { X, Archive, Check, AlertCircle, Loader2 } from 'lucide-react';
import { ExportPlatform, BackupProgressEvent } from '../../../types/export';
import { VaultBackupTab } from './export/VaultBackupTab';
import { StickerPackTab } from './export/StickerPackTab';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalStickers: number;
  selectedItemIds: string[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  totalStickers,
  selectedItemIds,
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'pack'>('vault');
  const [platform, setPlatform] = useState<ExportPlatform>('telegram');
  const [packTitle, setPackTitle] = useState('Sticker Pack');
  const [packAuthor, setPackAuthor] = useState('Sticker Chest');
  const [scope, setScope] = useState<'selected' | 'all'>(selectedItemIds.length > 0 ? 'selected' : 'all');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<BackupProgressEvent | null>(null);
  const [result, setResult] = useState<{ success?: boolean; message?: string; outputPath?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setScope(selectedItemIds.length > 0 ? 'selected' : 'all');
      setResult(null);
      setProgress(null);
      setIsExporting(false);
    }
  }, [isOpen, selectedItemIds.length]);

  useEffect(() => {
    if (!isOpen) return;
    return window.stickerChest.onExportProgress((p) => setProgress(p));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExportVault = async () => {
    setIsExporting(true);
    setResult(null);
    try {
      const res = await window.stickerChest.createVaultBackup();
      if (!res.canceled) {
        setResult(
          res.success
            ? { success: true, message: `Vault exported (${res.totalItems} stickers)`, outputPath: res.outputPath }
            : { success: false, message: res.error || 'Vault export failed' }
        );
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Export error' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPack = async () => {
    setIsExporting(true);
    setResult(null);
    try {
      let targetIds = selectedItemIds;
      if (scope === 'all' || targetIds.length === 0) {
        const all = await window.stickerChest.searchItems({ limit: 100000 });
        targetIds = all.items.map((i) => i.id);
      }
      const res = await window.stickerChest.exportStickerPack({ platform, itemIds: targetIds, packTitle, packAuthor });
      if (!res.canceled) {
        setResult(
          res.success
            ? { success: true, message: `Pack exported (${res.totalExported} stickers)`, outputPath: res.outputPath }
            : { success: false, message: res.error || 'Pack export failed' }
        );
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Export error' });
    } finally {
      setIsExporting(false);
    }
  };

  const exportCount = scope === 'selected' && selectedItemIds.length > 0 ? selectedItemIds.length : totalStickers;
  const percent = progress && progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div className="w-[520px] bg-[#1a1b1e] border border-[#2c2e33] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2c2e33] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Archive className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-sm text-gray-200">Export Stickers &amp; Vault</h3>
          </div>
          <button onClick={onClose} disabled={isExporting} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#25262b] disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#2c2e33] bg-[#141517] px-4 pt-2 space-x-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('vault')}
            className={`pb-2 border-b-2 transition-colors ${activeTab === 'vault' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            Vault Backup (.stickervault)
          </button>
          <button
            onClick={() => setActiveTab('pack')}
            className={`pb-2 border-b-2 transition-colors ${activeTab === 'pack' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
          >
            Third-Party Sticker Pack
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          {activeTab === 'vault' ? (
            <VaultBackupTab totalStickers={totalStickers} />
          ) : (
            <StickerPackTab
              platform={platform}
              onSelectPlatform={setPlatform}
              scope={scope}
              onSelectScope={setScope}
              packTitle={packTitle}
              onChangePackTitle={setPackTitle}
              totalStickers={totalStickers}
              selectedCount={selectedItemIds.length}
            />
          )}

          {/* Progress bar */}
          {isExporting && (
            <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-300">
                <span className="flex items-center space-x-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Processing {progress?.currentFile || 'files'}...</span>
                </span>
                <span>{percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#25262b] rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-200" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )}

          {/* Result message */}
          {result && (
            <div className={`p-3 rounded-xl border flex items-start space-x-2 text-[11px] ${result.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
              {result.success ? <Check className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
              <div className="space-y-0.5">
                <div className="font-semibold">{result.message}</div>
                {result.outputPath && <div className="text-[10px] text-gray-400 truncate max-w-sm">{result.outputPath}</div>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2c2e33] bg-[#141517] flex justify-end space-x-2">
          <button onClick={onClose} disabled={isExporting} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50">
            Close
          </button>
          <button
            onClick={activeTab === 'vault' ? handleExportVault : handleExportPack}
            disabled={isExporting || exportCount === 0}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors disabled:opacity-50 flex items-center space-x-1.5"
          >
            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>{activeTab === 'vault' ? 'Export Vault Archive' : `Export ${exportCount} Stickers`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
