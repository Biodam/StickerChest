import React, { useState } from 'react';
import { X, Folder, Key, Sparkles, Check, AlertCircle, RefreshCw, Cloud, Clipboard } from 'lucide-react';
import { AppSettings } from '../../../types/models';

interface SettingsModalProps {
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (settings: Partial<AppSettings>) => void;
  onSelectFolder: () => Promise<string | null>;
  onTestKey: (apiKey: string, model?: string) => Promise<{ valid: boolean; message?: string }>;
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
  const [model, setModel] = useState(
    settings.geminiModel === 'gemini-2.5-flash' ? 'gemini-3.8-flash' : (settings.geminiModel || 'gemini-3.8-flash')
  );
  const [syncInterval, setSyncInterval] = useState(settings.syncIntervalMinutes ?? 15);
  const [autoTag, setAutoTag] = useState(settings.autoAiTagOnIngest ?? true);
  const [autoPaste, setAutoPaste] = useState(settings.autoPasteOnSelect ?? true);
  const [testStatus, setTestStatus] = useState<{ testing: boolean; valid?: boolean; message?: string }>({
    testing: false,
  });

  React.useEffect(() => {
    setFolder(settings.sourceFolder);
    setApiKey(settings.geminiApiKey);
    const m = settings.geminiModel === 'gemini-2.5-flash' ? 'gemini-3.8-flash' : (settings.geminiModel || 'gemini-3.8-flash');
    setModel(m);
    setSyncInterval(settings.syncIntervalMinutes ?? 15);
    setAutoTag(settings.autoAiTagOnIngest ?? true);
    setAutoPaste(settings.autoPasteOnSelect ?? true);
    setTestStatus({ testing: false });
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleBrowse = async () => {
    const selected = await onSelectFolder();
    if (selected) {
      setFolder(selected);
    }
  };

  const handleTestKey = async () => {
    setTestStatus({ testing: true });
    const res = await onTestKey(apiKey, model);
    setTestStatus({ testing: false, valid: res.valid, message: res.message });
  };

  const handleSave = () => {
    onSaveSettings({
      sourceFolder: folder,
      geminiApiKey: apiKey,
      geminiModel: model,
      syncIntervalMinutes: syncInterval,
      autoAiTagOnIngest: autoTag,
      autoPasteOnSelect: autoPaste,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div className="w-[520px] bg-[#1a1b1e] border border-[#2c2e33] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
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
        <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
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
                onClick={handleBrowse}
                className="px-3 py-2 rounded-lg bg-[#25262b] hover:bg-[#2c2e33] text-gray-200 font-medium border border-[#2c2e33] transition-colors shrink-0"
              >
                Browse...
              </button>
            </div>
            {/* Cloud Drive & Multi-Device Sync badge */}
            <div className="flex flex-col space-y-1 mt-1.5 text-[11px] text-blue-300 bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
              <div className="flex items-center space-x-1.5 font-medium">
                <Cloud className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Multi-Device Sync Ready (Google Drive / OneDrive / iCloud)</span>
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                Sticker Chest saves database &amp; resized variants in <code className="text-blue-300">.stickerchest/</code> inside your selected folder. Use the same folder across Windows and Mac without re-importing!
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
                onChange={(e) => setSyncInterval(Number(e.target.value))}
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
                  onChange={(e) => setAutoTag(e.target.checked)}
                  className="rounded border-[#2c2e33] text-blue-600 focus:ring-0 bg-[#121316] w-4 h-4"
                />
                <span className="text-gray-300">Auto-tag on import</span>
              </label>
            </div>
          </div>

          {/* Quick Picker & Auto-Paste Behavior */}
          <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-gray-200 font-medium flex items-center space-x-1.5">
                <Clipboard className="w-3.5 h-3.5 text-blue-400" />
                <span>Quick Picker Auto-Paste</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoPaste}
                  onChange={(e) => setAutoPaste(e.target.checked)}
                  className="rounded border-[#2c2e33] text-blue-600 focus:ring-0 bg-[#121316] w-4 h-4"
                />
                <span className="text-xs text-gray-300 font-medium">Auto-paste on select</span>
              </label>
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              When you select a sticker in the floating Quick Picker (<kbd className="px-1 py-0.5 bg-[#25262b] rounded text-gray-300 text-[10px]">Win + /</kbd>), Sticker Chest automatically pastes it directly into your active chat or document input field.
            </p>
          </div>

          {/* Gemini AI Settings (Optional) */}
          <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-gray-200 font-medium flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Google Gemini AI (Optional)</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-medium bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                Offline Local Mode Always Active
              </span>
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              Importing, multi-tier resizing, and manual tagging work 100% offline without an API key. Gemini enables automated vision character/feeling extraction.
            </p>

            {/* Model Selector */}
            <div>
              <label className="text-gray-400 block mb-1">Gemini Vision Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#1a1b1e] border border-[#2c2e33] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-amber-500"
              >
                <option value="gemini-3.8-flash">gemini-3.8-flash (Recommended by Google)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash (Fast & Multimodal)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash (Standard)</option>
                <option value="gemini-1.5-pro">gemini-1.5-pro (High Precision)</option>
              </select>
            </div>

            {/* API Key Input */}
            <div>
              <label className="text-gray-400 block mb-1">API Key</label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setTestStatus({ testing: false });
                  }}
                  className="flex-1 px-3 py-1.5 bg-[#1a1b1e] border border-[#2c2e33] rounded-lg text-xs text-gray-300 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleTestKey}
                  disabled={testStatus.testing || !apiKey}
                  className="px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 font-medium border border-amber-500/30 transition-colors disabled:opacity-50 shrink-0"
                >
                  {testStatus.testing ? 'Testing...' : 'Test Key'}
                </button>
              </div>
              {testStatus.valid !== undefined && (
                <div className={`flex items-center space-x-1.5 mt-1.5 text-[11px] ${testStatus.valid ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {testStatus.valid ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{testStatus.valid ? 'API Key and model validated successfully!' : testStatus.message || 'Validation failed'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Global Shortcut Notice */}
          <div className="p-3 rounded-xl bg-[#121316] border border-[#2c2e33] text-gray-400 text-[11px]">
            <span className="font-semibold text-gray-300 block mb-0.5">Quick Picker Global Hotkey</span>
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#25262b] border border-[#2c2e33] text-white font-mono">Win + /</kbd> (Windows) or <kbd className="px-1.5 py-0.5 rounded bg-[#25262b] border border-[#2c2e33] text-white font-mono">Ctrl + /</kbd> (macOS) anywhere to summon picker.</span>
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
