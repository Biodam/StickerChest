import { StickerItem, SearchFilterOptions, IngestionProgressEvent, AppSettings, ImageTier, LibraryFacets } from './models';

export interface StickerVaultAPI {
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

  // Bulk Operations
  deleteItems: (itemIds: string[]) => Promise<boolean>;
  bulkAddTags: (itemIds: string[], tags: string[]) => Promise<boolean>;
  bulkRemoveTags: (itemIds: string[], tags: string[]) => Promise<boolean>;
  bulkToggleFavorite: (itemIds: string[], favorite: boolean) => Promise<boolean>;
  bulkSetCustomAttribute: (itemIds: string[], key: string, value: string) => Promise<boolean>;

  // Vault & Ingestion
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

  // Window Controls
  hidePicker: () => Promise<void>;
  openManager: () => Promise<void>;
}

declare global {
  interface Window {
    stickerVault: StickerVaultAPI;
  }
}
