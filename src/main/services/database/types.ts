import { ImageTier } from '../../../types/models';

export interface ItemRow {
  id: string;
  sha256_hash: string;
  filename: string;
  original_path: string;
  ext: string;
  mime_type: string;
  width: number;
  height: number;
  file_size_bytes: number;
  is_animated: number;
  frame_count: number;
  created_at: string;
  updated_at: string;
}

export interface VariantRow {
  id: string;
  item_id: string;
  tier: ImageTier;
  file_path: string;
  format: string;
  width: number;
  height: number;
  file_size_bytes: number;
  created_at: string;
}

export interface MetadataRow {
  id: string;
  item_id: string;
  character: string | null;
  source_origin: string | null;
  action: string | null;
  feeling: string | null;
  description: string | null;
  ai_model: string | null;
  ai_status: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_only';
  ai_error: string | null;
  raw_ai_json: string | null;
  created_at: string;
  updated_at: string;
}

export interface UsageRow {
  item_id: string;
  is_favorite: number;
  copy_count: number;
  last_copied_at: string | null;
  created_at: string;
}

export interface ItemInsertInput {
  id?: string;
  sha256Hash: string;
  filename: string;
  originalPath: string;
  ext: string;
  mimeType: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  isAnimated: boolean;
  frameCount?: number;
}

export interface VariantInsertInput {
  id?: string;
  itemId: string;
  tier: ImageTier;
  filePath: string;
  format: string;
  width: number;
  height: number;
  fileSizeBytes: number;
}

export interface MetadataUpsertInput {
  itemId: string;
  character?: string | null;
  sourceOrigin?: string | null;
  action?: string | null;
  feeling?: string | null;
  description?: string | null;
  aiModel?: string | null;
  aiStatus?: 'pending' | 'processing' | 'completed' | 'failed' | 'manual_only';
  aiError?: string | null;
  rawAiJson?: string | null;
  tags?: string[];
  customAttributes?: Record<string, string>;
}
