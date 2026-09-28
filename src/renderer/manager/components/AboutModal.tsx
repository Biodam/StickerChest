import React, { useState, useEffect } from 'react';
import { X, Sparkles, GitCommit, HardDrive, Database, Cpu, ExternalLink, Copy, Check } from 'lucide-react';
import { AboutInfo } from '../../../types/models';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [info, setInfo] = useState<AboutInfo | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const api = window.stickerChest || window.stickerVault;
    if (api?.getAboutInfo) {
      api.getAboutInfo().then(setInfo);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyHash = () => {
    if (!info?.commitHash) return;
    navigator.clipboard.writeText(info.commitHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1a1b1e] border border-[#2c2e33] rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#2c2e33] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">About Sticker Chest</h2>
              <p className="text-xs text-gray-400">AI-Powered Sticker & GIF Companion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#25262b] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Version & Commit Badge */}
          <div className="flex items-center justify-between p-3 bg-[#121316] border border-[#2c2e33] rounded-xl">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white tracking-wide">
                  v{info?.version || '0.0.5'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  Latest Build
                </span>
              </div>
              <div className="flex items-center space-x-1.5 mt-1 text-xs text-gray-400">
                <GitCommit className="w-3.5 h-3.5 text-gray-400" />
                <span className="font-mono text-[11px] text-gray-300">
                  {info?.commitHash || 'c51461d'}
                </span>
              </div>
            </div>
            <button
              onClick={handleCopyHash}
              title="Copy commit hash"
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#25262b] hover:bg-[#2c2e33] text-xs font-medium text-gray-300 transition-colors"
            >
              {copiedHash ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Useful Read-Only Metrics & Storage */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Vault & Storage</h3>
            <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl space-y-2.5 text-xs">
              <div className="flex items-start space-x-2">
                <HardDrive className="w-3.5 h-3.5 text-sky-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-400">Vault Directory</div>
                  <div className="text-gray-200 font-mono text-[11px] truncate" title={info?.vaultPath}>
                    {info?.vaultPath || 'Default AppData Vault'}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Database className="w-3.5 h-3.5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-gray-400">Catalog Database</div>
                  <div className="text-gray-200 flex items-center justify-between">
                    <span className="font-mono text-[11px] truncate" title={info?.databasePath}>SQLite WAL</span>
                    <span className="text-blue-400 font-semibold">{info?.totalStickers ?? 0} items indexed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System & Runtime Specs */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Environment Specs</h3>
            <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[11px] text-gray-400">Platform</span>
                <p className="font-medium text-gray-200">{info?.platform} ({info?.arch})</p>
              </div>
              <div>
                <span className="text-[11px] text-gray-400">Electron</span>
                <p className="font-medium text-gray-200">v{info?.electronVersion}</p>
              </div>
              <div>
                <span className="text-[11px] text-gray-400">Node Runtime</span>
                <p className="font-medium text-gray-200">{info?.nodeVersion}</p>
              </div>
              <div>
                <span className="text-[11px] text-gray-400">Chromium</span>
                <p className="font-medium text-gray-200">{info?.chromeVersion}</p>
              </div>
            </div>
          </div>

          {/* External Links */}
          <div className="pt-1 flex items-center justify-between text-xs text-gray-400 border-t border-[#2c2e33]">
            <a
              href="https://github.com/Biodam/StickerChest"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 hover:text-blue-400 transition-colors"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/Biodam/StickerChest/issues"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-1 hover:text-blue-400 transition-colors"
            >
              <span>Report Issue</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>MIT License</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2c2e33] bg-[#121316] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#25262b] hover:bg-[#2c2e33] text-xs font-medium text-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
