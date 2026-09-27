import React, { useState, useEffect } from 'react';
import { X, UploadCloud, Check, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { ConflictResolution, BackupProgressEvent, RestoreSummary } from '../../../types/export';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreComplete: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onRestoreComplete }) => {
  const [conflictResolution, setConflictResolution] = useState<ConflictResolution>('skip');
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState<BackupProgressEvent | null>(null);
  const [summary, setSummary] = useState<RestoreSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsRestoring(false);
      setProgress(null);
      setSummary(null);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = window.stickerChest.onExportProgress((p) => {
      setProgress(p);
    });
    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartRestore = async () => {
    setIsRestoring(true);
    setError(null);
    setSummary(null);

    try {
      const res = await window.stickerChest.restoreVaultBackup({ conflictResolution });
      if (res.canceled) {
        setIsRestoring(false);
        return;
      }
      if (res.success) {
        setSummary({
          restored: res.restored ?? 0,
          skipped: res.skipped ?? 0,
          overwritten: res.overwritten ?? 0,
          errors: res.errors ?? 0,
        });
        onRestoreComplete();
      } else {
        setError(res.error || 'Failed to restore backup archive.');
      }
    } catch (err: any) {
      setError(err.message || 'Restoration failed unexpectedly.');
    } finally {
      setIsRestoring(false);
    }
  };

  const percent = progress && progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div className="w-[480px] bg-[#1a1b1e] border border-[#2c2e33] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2c2e33] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm text-gray-200">Restore &amp; Migrate Vault</h3>
          </div>
          <button onClick={onClose} disabled={isRestoring} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#25262b] disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-gray-400 leading-relaxed">
            Import stickers, multi-tier WebP caches, and metadata from an existing <code className="text-emerald-300">.stickervault</code> or <code className="text-emerald-300">.zip</code> archive.
          </p>

          {/* Conflict Resolution Settings */}
          <div>
            <label className="text-gray-300 font-medium block mb-2">Duplicate &amp; Conflict Strategy</label>
            <div className="space-y-2">
              <label className={`flex items-start space-x-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${conflictResolution === 'skip' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' : 'bg-[#121316] border-[#2c2e33] text-gray-300'}`}>
                <input
                  type="radio"
                  name="conflict"
                  checked={conflictResolution === 'skip'}
                  onChange={() => setConflictResolution('skip')}
                  className="mt-0.5 text-emerald-500 focus:ring-0"
                />
                <div>
                  <div className="font-medium text-xs">Skip Existing (Recommended)</div>
                  <div className="text-[10px] text-gray-500">Leaves already imported stickers and user edits intact.</div>
                </div>
              </label>

              <label className={`flex items-start space-x-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${conflictResolution === 'merge' ? 'bg-blue-500/10 border-blue-500/40 text-blue-200' : 'bg-[#121316] border-[#2c2e33] text-gray-300'}`}>
                <input
                  type="radio"
                  name="conflict"
                  checked={conflictResolution === 'merge'}
                  onChange={() => setConflictResolution('merge')}
                  className="mt-0.5 text-blue-500 focus:ring-0"
                />
                <div>
                  <div className="font-medium text-xs">Merge Metadata &amp; Tags</div>
                  <div className="text-[10px] text-gray-500">Combines tags and fills empty metadata fields without deleting files.</div>
                </div>
              </label>

              <label className={`flex items-start space-x-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${conflictResolution === 'overwrite' ? 'bg-purple-500/10 border-purple-500/40 text-purple-200' : 'bg-[#121316] border-[#2c2e33] text-gray-300'}`}>
                <input
                  type="radio"
                  name="conflict"
                  checked={conflictResolution === 'overwrite'}
                  onChange={() => setConflictResolution('overwrite')}
                  className="mt-0.5 text-purple-500 focus:ring-0"
                />
                <div>
                  <div className="font-medium text-xs">Overwrite / Replace</div>
                  <div className="text-[10px] text-gray-500">Replaces existing database records and cache files with backup versions.</div>
                </div>
              </label>
            </div>
          </div>

          {/* Progress Indicator */}
          {isRestoring && (
            <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-300">
                <span className="flex items-center space-x-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  <span>Restoring {progress?.currentFile || 'assets'}...</span>
                </span>
                <span>{percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#25262b] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-200" style={{ width: `${percent}%` }} />
              </div>
            </div>
          )}

          {/* Summary Banner */}
          {summary && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1.5 text-xs">
              <div className="flex items-center space-x-1.5 font-semibold text-emerald-400">
                <Check className="w-4 h-4" />
                <span>Restoration Completed Successfully!</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="bg-[#121316]/60 p-1.5 rounded">New: <strong className="text-white">{summary.restored}</strong></div>
                <div className="bg-[#121316]/60 p-1.5 rounded">Merged/Updated: <strong className="text-white">{summary.overwritten}</strong></div>
                <div className="bg-[#121316]/60 p-1.5 rounded">Skipped: <strong className="text-white">{summary.skipped}</strong></div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2c2e33] bg-[#141517] flex justify-end space-x-2">
          <button onClick={onClose} disabled={isRestoring} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50">
            {summary ? 'Done' : 'Cancel'}
          </button>
          {!summary && (
            <button
              onClick={handleStartRestore}
              disabled={isRestoring}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition-colors disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isRestoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
              <span>Select File &amp; Restore</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
