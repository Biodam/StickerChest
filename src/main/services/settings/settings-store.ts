import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { AppSettings } from '../../../types/models';
import { setGeminiApiKey, setGeminiModel } from '../gemini/client';
import { registerGlobalShortcuts } from '../../shortcuts/globalShortcuts';
import { getIngestionService } from '../ingestion/folder-watcher';
import { setCustomVaultRoot, ensureVaultDirectories } from '../ingestion/paths';
import { switchDatabase } from '../database/connection';

const DEFAULT_SETTINGS: AppSettings = {
  sourceFolder: '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: 'gemini-3.8-flash',
  globalShortcut: 'Alt+Shift+V',
  preferredCopyTier: 'sticker',
  autoStartAtLogin: false,
  syncIntervalMinutes: 15,
  autoAiTagOnIngest: true,
  cloudDriveMode: true,
  autoPasteOnSelect: true,
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

  // Auto-upgrade deprecated gemini-2.5-flash model
  if (loaded.geminiModel === 'gemini-2.5-flash') {
    loaded.geminiModel = 'gemini-3.8-flash';
  }

  cachedSettings = loaded;

  if (loaded.geminiApiKey) {
    setGeminiApiKey(loaded.geminiApiKey);
  }
  if (loaded.geminiModel) {
    setGeminiModel(loaded.geminiModel);
  }
  if (loaded.sourceFolder) {
    setCustomVaultRoot(loaded.sourceFolder);
    ensureVaultDirectories();
    const dbPath = path.join(loaded.sourceFolder, '.stickervault', 'stickervault.db');
    switchDatabase(dbPath);
    getIngestionService().startWatching(loaded.sourceFolder, loaded.syncIntervalMinutes);
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
  if (partial.syncIntervalMinutes !== undefined) {
    getIngestionService().setPeriodicInterval(partial.syncIntervalMinutes);
  }
  if (partial.sourceFolder && partial.sourceFolder !== current.sourceFolder) {
    setCustomVaultRoot(partial.sourceFolder);
    ensureVaultDirectories();
    const dbPath = path.join(partial.sourceFolder, '.stickervault', 'stickervault.db');
    switchDatabase(dbPath);
    getIngestionService().startWatching(partial.sourceFolder, updated.syncIntervalMinutes);
  }

  return updated;
}
