import { StickerMetadata, ImageTier } from './models';

export type { ImageTier };
export type ExportPlatform = 'telegram' | 'discord-emoji' | 'discord-sticker' | 'whatsapp';

export interface VaultManifestVariant {
  tier: ImageTier;
  pathRel: string;
  format: string;
  width: number;
  height: number;
  fileSizeBytes: number;
}

export interface VaultManifestItem {
  id: string;
  sha256Hash: string;
  filename: string;
  originalPathRel: string;
  ext: string;
  mimeType: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  isAnimated: boolean;
  frameCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  userTags: string[];
  customAttributes: Record<string, string>;
  metadata?: StickerMetadata | null;
  variants: Partial<Record<ImageTier, VaultManifestVariant>>;
}

export interface VaultManifest {
  version: string;
  generator: string;
  exportedAt: string;
  totalItems: number;
  items: VaultManifestItem[];
}

export interface PackExportOptions {
  platform: ExportPlatform;
  itemIds: string[];
  outputZipPath: string;
  packTitle?: string;
  packAuthor?: string;
}

export interface BackupProgressEvent {
  stage: 'manifest' | 'database' | 'assets' | 'packing' | 'extracting' | 'restoring' | 'done' | 'error';
  currentFile?: string;
  processed: number;
  total: number;
  error?: string;
}

export type ConflictResolution = 'skip' | 'overwrite' | 'merge';

export interface RestoreOptions {
  backupFilePath: string;
  conflictResolution: ConflictResolution;
}

export interface RestoreSummary {
  restored: number;
  skipped: number;
  overwritten: number;
  errors: number;
}
