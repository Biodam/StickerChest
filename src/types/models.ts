export type ImageTier = 'raw' | 'sticker' | 'emoji' | 'thumb';

export interface StickerItem {
  id: string;
  sha256Hash: string;
  filename: string;
  originalPath: string;
  ext: string;
  mimeType: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  isAnimated: boolean;
  frameCount: number;
  createdAt: string;
  updatedAt: string;
  variants: Record<ImageTier, StickerVariant | null>;
  metadata: StickerMetadata | null;
  tags: string[];
  userTags: string[];
  customAttributes: Record<string, string>;
  usage: UsageStats;
}

export interface StickerVariant {
  id: string;
  itemId: string;
  tier: ImageTier;
  filePath: string;
  format: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  createdAt: string;
}

export interface StickerMetadata {
  id: string;
  itemId: string;
  character: string | null;
  sourceOrigin: string | null;
  action: string | null;
  feeling: string | null;
  description: string | null;
  aiModel: string | null;
  aiStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_only';
  aiError?: string | null;
  userLockedFields: string[];
  isUserEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsageStats {
  itemId: string;
  isFavorite: boolean;
  copyCount: number;
  lastCopiedAt: string | null;
}

export interface SearchFilterOptions {
  query?: string;
  tab?: 'recent' | 'favorites' | 'all';
  character?: string;
  sourceOrigin?: string;
  feeling?: string;
  tag?: string;
  isAnimated?: boolean;
  limit?: number;
  offset?: number;
}

export interface FilterFacet {
  name: string;
  count: number;
}

export interface LibraryFacets {
  franchises: FilterFacet[];
  characters: FilterFacet[];
  tags: FilterFacet[];
}

export interface IngestionProgressEvent {
  status: 'scanning' | 'hashing' | 'resizing' | 'tagging' | 'idle' | 'error';
  currentFile?: string;
  processedCount: number;
  totalCount: number;
  error?: string;
}

export type ThemeId = 'slate_dark' | 'oled_black' | 'cyberpunk' | 'catppuccin' | 'paper_light';

export type SyncState = 'idle' | 'authenticating' | 'syncing' | 'downloading' | 'error' | 'synced';

export interface SyncProgress {
  state: SyncState;
  currentStep?: string;
  filesTransferred: number;
  totalFiles: number;
  bytesTransferred: number;
  totalBytes: number;
  lastSyncTimestamp: number | null;
  errorMessage?: string;
}

export interface GoogleDriveAccountInfo {
  connected: boolean;
  email?: string;
  displayName?: string;
  storageUsedBytes?: number;
  storageTotalBytes?: number;
  lastSyncTimestamp?: number | null;
}

export interface AppSettings {
  sourceFolder: string;
  geminiApiKey: string;
  geminiModel: string;
  globalShortcut: string;
  preferredCopyTier: 'sticker' | 'emoji';
  autoStartAtLogin: boolean;
  syncIntervalMinutes: number;
  autoAiTagOnIngest: boolean;
  cloudDriveMode: boolean;
  autoPasteOnSelect: boolean;
  animationPlaybackMode?: 'always' | 'hover' | 'reduced_motion';
  theme?: ThemeId;
  googleDriveSyncEnabled?: boolean;
  googleDriveAutoSync?: boolean;
  googleDriveClientId?: string;
  googleDriveClientSecret?: string;
}

export interface AboutInfo {
  appName: string;
  version: string;
  commitHash: string;
  electronVersion: string;
  chromeVersion: string;
  nodeVersion: string;
  v8Version: string;
  platform: string;
  arch: string;
  osRelease: string;
  vaultPath: string;
  databasePath: string;
  logPath: string;
  totalStickers: number;
}



