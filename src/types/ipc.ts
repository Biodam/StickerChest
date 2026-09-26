import { StickerItem, SearchFilterOptions, IngestionProgressEvent, AppSettings, ImageTier } from './models';

export interface StickerVaultAPI {
  // Database & Search
  searchItems: (options: SearchFilterOptions) => Promise<{ items: StickerItem[]; total: number }>;
  getItem: (id: string) => Promise<StickerItem | null>;
  toggleFavorite: (itemId: string) => Promise<boolean>;
  updateMetadata: (itemId: string, metadata: {
    character?: string;
    sourceOrigin?: string;
    action?: string;
    feeling?: string;
    description?: string;
    tags?: string[];
    customAttributes?: Record<string, string>;
  }) => Promise<boolean>;

  // Clipboard
  copyItemToClipboard: (itemId: string, tier?: ImageTier) => Promise<boolean>;

  // Vault & Ingestion
  scanSourceFolder: (forceReprocess?: boolean) => Promise<{ started: boolean }>;
  onIngestionProgress: (callback: (progress: IngestionProgressEvent) => void) => () => void;

  // AI Tagging
  tagItemWithGemini: (itemId: string) => Promise<boolean>;
  testGeminiKey: (apiKey: string) => Promise<{ valid: boolean; message?: string }>;

  // Settings
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<boolean>;
  selectFolderDialog: () => Promise<string | null>;

  // Window Controls
  hidePicker: () => Promise<void>;
  openManager: () => Promise<void>;
}

declare global {
  interface Window {
    stickerVault: StickerVaultAPI;
  }
}
