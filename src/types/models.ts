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
}
