import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { AppSettings } from '../../../types/models';
import { setGeminiApiKey, setGeminiModel } from '../gemini/client';
import { registerGlobalShortcuts } from '../../shortcuts/globalShortcuts';
import { getIngestionService } from '../ingestion/folder-watcher';

const DEFAULT_SETTINGS: AppSettings = {
  sourceFolder: '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: 'gemini-2.5-flash',
  globalShortcut: 'Alt+Shift+V',
  preferredCopyTier: 'sticker',
  autoStartAtLogin: false,
};

let cachedSettings: AppSettings | null = null;

function getSettingsFilePath(): string {
  try {
    const userData = app.getPath('userData');
    return path.join(userData, 'settings.json');
  } catch {
    return path.resolve(process.cwd(), '.data', 'settings.json');
  }
}

export function loadSettings(): AppSettings {
  if (cachedSettings) return cachedSettings;

  let loaded: AppSettings;
  const filePath = getSettingsFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      loaded = { ...DEFAULT_SETTINGS, ...data };
    } else {
      loaded = { ...DEFAULT_SETTINGS };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
    loaded = { ...DEFAULT_SETTINGS };
  }

  cachedSettings = loaded;

  if (loaded.geminiApiKey) {
    setGeminiApiKey(loaded.geminiApiKey);
  }
  if (loaded.geminiModel) {
    setGeminiModel(loaded.geminiModel);
  }
  if (loaded.sourceFolder) {
    getIngestionService().startWatching(loaded.sourceFolder);
  }

  return loaded;
}

export function saveSettings(partial: Partial<AppSettings>): AppSettings {
  const current = loadSettings();
  const updated: AppSettings = { ...current, ...partial };
  cachedSettings = updated;

  const filePath = getSettingsFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save settings:', err);
  }

  if (partial.geminiApiKey !== undefined) {
    setGeminiApiKey(partial.geminiApiKey);
  }
  if (partial.geminiModel !== undefined) {
    setGeminiModel(partial.geminiModel);
  }
  if (partial.globalShortcut !== undefined) {
    registerGlobalShortcuts(partial.globalShortcut);
  }
  if (partial.sourceFolder && partial.sourceFolder !== current.sourceFolder) {
    getIngestionService().startWatching(partial.sourceFolder);
  }

  return updated;
}
