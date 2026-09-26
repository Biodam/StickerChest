import type { Database } from 'better-sqlite3';
import { getDatabase } from './connection';
import { ItemInsertInput, VariantInsertInput, MetadataUpsertInput } from './types';
import { StickerItem, SearchFilterOptions, UsageStats } from '../../../types/models';
import * as itemQueries from './item-queries';
import * as metaQueries from './metadata-queries';
import * as searchQueries from './search-queries';
import * as usageQueries from './usage-queries';

export class StickerDatabaseDAL {
  private db: Database;

  constructor(customDb?: Database) {
    this.db = customDb || getDatabase();
  }

  // Items & Variants
  public upsertItem(input: ItemInsertInput): string {
    return itemQueries.upsertItem(this.db, input);
  }

  public upsertVariant(input: VariantInsertInput): string {
    return itemQueries.upsertVariant(this.db, input);
  }

  public getItemById(id: string): StickerItem | null {
    return itemQueries.getItemById(this.db, id);
  }

  public getItemByHash(hash: string): StickerItem | null {
    return itemQueries.getItemByHash(this.db, hash);
  }

  public deleteItem(id: string): boolean {
    return itemQueries.deleteItem(this.db, id);
  }

  // Metadata, Tags, Custom Attributes
  public saveMetadata(input: MetadataUpsertInput): void {
    metaQueries.upsertMetadata(this.db, input);
  }

  public setTags(itemId: string, tags: string[], isAiGenerated = true): void {
    metaQueries.setTags(this.db, itemId, tags, isAiGenerated);
  }

  public removeTag(itemId: string, tagName: string): void {
    metaQueries.removeTag(this.db, itemId, tagName);
  }

  public setCustomAttributes(itemId: string, attributes: Record<string, string>): void {
    metaQueries.setCustomAttributes(this.db, itemId, attributes);
  }

  // Search & Retrieval
  public searchItems(options: SearchFilterOptions): { items: StickerItem[]; total: number } {
    return searchQueries.searchItems(this.db, options);
  }

  // Usage & Favorites
  public toggleFavorite(itemId: string, forceState?: boolean): boolean {
    return usageQueries.toggleFavorite(this.db, itemId, forceState);
  }

  public recordItemUsage(itemId: string): void {
    usageQueries.recordItemUsage(this.db, itemId);
  }

  public getUsageStats(itemId: string): UsageStats {
    return usageQueries.getUsageStats(this.db, itemId);
  }
}

let defaultDalInstance: StickerDatabaseDAL | null = null;

export function getDatabaseDAL(): StickerDatabaseDAL {
  if (!defaultDalInstance) {
    defaultDalInstance = new StickerDatabaseDAL();
  }
  return defaultDalInstance;
}
