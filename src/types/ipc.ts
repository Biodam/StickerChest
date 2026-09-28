import {
  StickerItem,
  SearchFilterOptions,
  IngestionProgressEvent,
  AppSettings,
  ImageTier,
  LibraryFacets,
  SyncProgress,
  GoogleDriveAccountInfo,
  AboutInfo,
} from './models';

export interface StickerChestAPI {
  // App & About
  getAboutInfo: () => Promise<AboutInfo>;
  onOpenAbout: (callback: () => void) => () => void;
  // Database & Search
  searchItems: (options: SearchFilterOptions) => Promise<{ items: StickerItem[]; total: number }>;
  getFacets: () => Promise<LibraryFacets>;
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
  copyAndPasteItem: (itemId: string, tier?: ImageTier) => Promise<boolean>;

  // Bulk Operations
  deleteItems: (itemIds: string[]) => Promise<boolean>;
  bulkAddTags: (itemIds: string[], tags: string[]) => Promise<boolean>;
  bulkRemoveTags: (itemIds: string[], tags: string[]) => Promise<boolean>;
  bulkToggleFavorite: (itemIds: string[], favorite: boolean) => Promise<boolean>;
  bulkSetCustomAttribute: (itemIds: string[], key: string, value: string) => Promise<boolean>;

  // Chest & Ingestion
  ingestFiles: (filePaths: string[]) => Promise<{ ingested: number; duplicates: number; errors: number }>;
  scanSourceFolder: (forceReprocess?: boolean, folderPath?: string) => Promise<{ started: boolean }>;
  onIngestionProgress: (callback: (progress: IngestionProgressEvent) => void) => () => void;
  showItemInFolder: (filePath: string) => Promise<boolean>;

  // AI Tagging
  tagItemWithGemini: (itemId: string) => Promise<boolean>;
  batchTagUntagged: () => Promise<{ started: boolean; total: number }>;
  getUntaggedCount: () => Promise<number>;
  testGeminiKey: (apiKey: string, model?: string) => Promise<{ valid: boolean; message?: string }>;

  // Settings
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<boolean>;
  selectFolderDialog: () => Promise<string | null>;
  onThemeChanged: (callback: (theme: string) => void) => () => void;

  // Vault Backup, Restore & Pack Exporters
  createVaultBackup: (customFilePath?: string) => Promise<{ canceled: boolean; success?: boolean; totalItems?: number; outputPath?: string; error?: string }>;
  restoreVaultBackup: (options?: { backupFilePath?: string; conflictResolution?: 'skip' | 'overwrite' | 'merge' }) => Promise<{ canceled: boolean; success?: boolean; restored?: number; skipped?: number; overwritten?: number; errors?: number; error?: string }>;
  exportStickerPack: (options: {
    platform: 'telegram' | 'discord-emoji' | 'discord-sticker' | 'whatsapp';
    itemIds: string[];
    outputZipPath?: string;
    packTitle?: string;
    packAuthor?: string;
  }) => Promise<{ canceled: boolean; success?: boolean; totalExported?: number; outputPath?: string; error?: string }>;
  onExportProgress: (callback: (progress: any) => void) => () => void;

  // Google Drive Cloud Sync
  syncGetAccountInfo: () => Promise<GoogleDriveAccountInfo>;
  syncConnectGoogleDrive: (clientId?: string, clientSecret?: string) => Promise<{ success: boolean; error?: string }>;
  syncDisconnectGoogleDrive: () => Promise<boolean>;
  syncTriggerNow: () => Promise<{ success: boolean; error?: string }>;
  onSyncProgress: (callback: (progress: SyncProgress) => void) => () => void;

  // Window Controls
  hidePicker: () => Promise<void>;
  openManager: () => Promise<void>;

  // Diagnostics & Logging
  logMessage?: (level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', tag: string, message: string, meta?: any) => Promise<boolean>;
  getRecentLogs?: (maxLines?: number) => Promise<string[]>;
  getLogPath?: () => Promise<string>;
}

export type StickerVaultAPI = StickerChestAPI;

declare global {
  interface Window {
    stickerChest: StickerChestAPI;
    stickerVault?: StickerChestAPI;
  }
}
