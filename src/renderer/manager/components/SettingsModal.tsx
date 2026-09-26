import React, { useState } from 'react';
import { X, Folder, Key, Sparkles, Check, AlertCircle } from 'lucide-react';
import { AppSettings } from '../../../types/models';

interface SettingsModalProps {
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onSelectFolder: () => Promise<string | null>;
  onTestKey: (apiKey: string) => Promise<{ valid: boolean; message?: string }>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSaveSettings,
  onSelectFolder,
  onTestKey,
}) => {
  const [folder, setFolder] = useState(settings.sourceFolder);
  const [apiKey, setApiKey] = useState(settings.geminiApiKey);
  const [testStatus, setTestStatus] = useState<{ testing: boolean; valid?: boolean; message?: string }>({
    testing: false,
  });

  if (!isOpen) return null;

  const handleBrowse = async () => {
    const selected = await onSelectFolder();
    if (selected) {
      setFolder(selected);
    }
  };

  const handleTestKey = async () => {
    setTestStatus({ testing: true });
    const res = await onTestKey(apiKey);
    setTestStatus({ testing: false, valid: res.valid, message: res.message });
  };

  const handleSave = () => {
    onSaveSettings({
      sourceFolder: folder,
      geminiApiKey: apiKey,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div className="w-[500px] bg-[#1a1b1e] border border-[#2c2e33] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2c2e33] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-sm text-gray-200">Settings & Configuration</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#25262b]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
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
                className="flex-1 px-3 py-2 bg-[#121316] border border-[#2c2e33] rounded-lg text-xs text-gray-300 focus:outline-none"
              />
              <button
                onClick={handleBrowse}
                className="px-3 py-2 rounded-lg bg-[#25262b] hover:bg-[#2c2e33] text-gray-200 font-medium border border-[#2c2e33] transition-colors"
              >
                Browse...
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Images and GIFs in this folder will be auto-resized and ingested.</p>
          </div>

          {/* Gemini API Key */}
          <div>
            <label className="text-gray-300 font-medium block mb-1.5 flex items-center space-x-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Gemini API Key</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setTestStatus({ testing: false });
                }}
                className="flex-1 px-3 py-2 bg-[#121316] border border-[#2c2e33] rounded-lg text-xs text-gray-300 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleTestKey}
                disabled={testStatus.testing || !apiKey}
                className="px-3 py-2 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 font-medium border border-amber-500/30 transition-colors disabled:opacity-50"
              >
                {testStatus.testing ? 'Testing...' : 'Test Key'}
              </button>
            </div>
            {testStatus.valid !== undefined && (
              <div className={`flex items-center space-x-1.5 mt-1.5 text-[11px] ${testStatus.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                {testStatus.valid ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{testStatus.valid ? 'API Key validated successfully!' : testStatus.message || 'Validation failed'}</span>
              </div>
            )}
          </div>

          {/* Global Shortcut Notice */}
          <div className="p-3 rounded-xl bg-[#121316] border border-[#2c2e33] text-gray-400">
            <span className="font-semibold text-gray-300 block mb-0.5">Quick Picker Global Hotkey</span>
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#25262b] border border-[#2c2e33] text-white font-mono">Alt + Shift + V</kbd> (Windows) or <kbd className="px-1.5 py-0.5 rounded bg-[#25262b] border border-[#2c2e33] text-white font-mono">Opt + Shift + V</kbd> (macOS) anywhere to summon picker.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2c2e33] bg-[#141517] flex justify-end space-x-2">
          <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-colors">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
