import React, { useState, useEffect } from 'react';
import { X, Sparkles, Clipboard, Film } from 'lucide-react';
import { AppSettings, ThemeId } from '../../../types/models';
import { FolderSyncCard } from './settings/FolderSyncCard';
import { GeminiAiCard } from './settings/GeminiAiCard';
import { HotkeyRecorder } from './HotkeyRecorder';
import { ThemeSelector } from './ThemeSelector';

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
  const [hotkey, setHotkey] = useState(settings.globalShortcut || 'Super+/');
  const [theme, setTheme] = useState<ThemeId>(settings.theme || 'slate_dark');
  const [animationMode, setAnimationMode] = useState<'always' | 'hover' | 'reduced_motion'>(
    settings.animationPlaybackMode || 'hover'
  );
  const [testStatus, setTestStatus] = useState<{ testing: boolean; valid?: boolean; message?: string }>({
    testing: false,
  });

  useEffect(() => {
    setFolder(settings.sourceFolder);
    setApiKey(settings.geminiApiKey);
    const m = settings.geminiModel === 'gemini-2.5-flash' ? 'gemini-3.8-flash' : (settings.geminiModel || 'gemini-3.8-flash');
    setModel(m);
    setSyncInterval(settings.syncIntervalMinutes ?? 15);
    setAutoTag(settings.autoAiTagOnIngest ?? true);
    setAutoPaste(settings.autoPasteOnSelect ?? true);
    setHotkey(settings.globalShortcut || 'Super+/');
    setTheme(settings.theme || 'slate_dark');
    setAnimationMode(settings.animationPlaybackMode || 'hover');
    setTestStatus({ testing: false });
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleBrowse = async () => {
    const selected = await onSelectFolder();
    if (selected) setFolder(selected);
  };

  const handleTestKey = async () => {
    setTestStatus({ testing: true });
    const res = await onTestKey(apiKey, model);
    setTestStatus({ testing: false, valid: res.valid, message: res.message });
  };

  const handleThemeChange = (newTheme: ThemeId) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSave = () => {
    onSaveSettings({
      sourceFolder: folder,
      geminiApiKey: apiKey,
      geminiModel: model,
      syncIntervalMinutes: syncInterval,
      autoAiTagOnIngest: autoTag,
      autoPasteOnSelect: autoPaste,
      globalShortcut: hotkey,
      theme,
      animationPlaybackMode: animationMode,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm select-none">
      <div className="w-[540px] bg-[#1a1b1e] border border-[#2c2e33] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#2c2e33] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-sm text-gray-200">Settings &amp; Configuration</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-[#25262b]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
          {/* Visual Theme Engine */}
          <ThemeSelector activeTheme={theme} onSelectTheme={handleThemeChange} />

          {/* Quick Picker Summon Shortcut */}
          <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl">
            <HotkeyRecorder currentHotkey={hotkey} onChangeHotkey={setHotkey} />
          </div>

          {/* Curated Source Folder & Scanning */}
          <FolderSyncCard
            folder={folder}
            onBrowse={handleBrowse}
            syncInterval={syncInterval}
            onChangeSyncInterval={setSyncInterval}
            autoTag={autoTag}
            onChangeAutoTag={setAutoTag}
          />

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
              When you select a sticker in the floating Quick Picker, Sticker Chest automatically pastes it directly into your active chat or document input field.
            </p>
          </div>

          {/* Animated Sticker Playback */}
          <div className="p-3 bg-[#121316] border border-[#2c2e33] rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-gray-200 font-medium flex items-center space-x-1.5">
                <Film className="w-3.5 h-3.5 text-purple-400" />
                <span>Animated Sticker Playback</span>
              </label>
              <select
                value={animationMode}
                onChange={(e) => setAnimationMode(e.target.value as 'always' | 'hover' | 'reduced_motion')}
                className="px-2.5 py-1 bg-[#1a1b1e] border border-[#2c2e33] rounded-lg text-xs text-gray-200 focus:outline-none focus:border-purple-500"
              >
                <option value="hover">Hover / Focus to Play (Recommended)</option>
                <option value="always">Always Animate (Continuous)</option>
                <option value="reduced_motion">Reduced Motion (Static Preview)</option>
              </select>
            </div>
            <p className="text-[10px] text-gray-400 leading-normal">
              Hover-to-play displays static first-frame thumbnails and animates only when hovered or selected, significantly reducing CPU &amp; GPU compositor load.
            </p>
          </div>

          {/* Gemini AI Settings */}
          <GeminiAiCard
            apiKey={apiKey}
            onChangeApiKey={(k) => { setApiKey(k); setTestStatus({ testing: false }); }}
            model={model}
            onChangeModel={setModel}
            onTestKey={handleTestKey}
            testStatus={testStatus}
          />
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
