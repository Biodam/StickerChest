import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database, { Database as DatabaseInstance } from 'better-sqlite3';
import { initializeSchema } from '../../src/main/services/database/schema';
import { StickerDatabaseDAL } from '../../src/main/services/database/dal';

describe('StickerDatabaseDAL & SQLite Schema', () => {
  let db: DatabaseInstance;
  let dal: StickerDatabaseDAL;

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    dal = new StickerDatabaseDAL(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should insert an item and retrieve it by ID and Hash', () => {
    const itemId = dal.upsertItem({
      sha256Hash: 'abc123hash',
      filename: 'anya_smug.png',
      originalPath: '/curated/anya_smug.png',
      ext: '.png',
      mimeType: 'image/png',
      width: 500,
      height: 500,
      fileSizeBytes: 102400,
      isAnimated: false,
    });

    expect(itemId).toBeDefined();

    const retrieved = dal.getItemById(itemId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.filename).toBe('anya_smug.png');
    expect(retrieved?.sha256Hash).toBe('abc123hash');
    expect(retrieved?.isAnimated).toBe(false);

    const byHash = dal.getItemByHash('abc123hash');
    expect(byHash?.id).toBe(itemId);
  });

  it('should insert and associate image variants', () => {
    const itemId = dal.upsertItem({
      sha256Hash: 'hash-variant-test',
      filename: 'miku_dance.gif',
      originalPath: '/curated/miku_dance.gif',
      ext: '.gif',
      mimeType: 'image/gif',
      width: 600,
      height: 600,
      fileSizeBytes: 500000,
      isAnimated: true,
      frameCount: 24,
    });

    dal.upsertVariant({
      itemId,
      tier: 'sticker',
      filePath: 'vault/stickers/miku_dance.webp',
      format: 'webp',
      width: 512,
      height: 512,
      fileSizeBytes: 204800,
    });

    dal.upsertVariant({
      itemId,
      tier: 'emoji',
      filePath: 'vault/emojis/miku_dance.webp',
      format: 'webp',
      width: 128,
      height: 128,
      fileSizeBytes: 40960,
    });

    const item = dal.getItemById(itemId);
    expect(item?.variants.sticker).not.toBeNull();
    expect(item?.variants.sticker?.width).toBe(512);
    expect(item?.variants.emoji).not.toBeNull();
    expect(item?.variants.emoji?.width).toBe(128);
    expect(item?.variants.thumb).toBeNull();
  });

  it('should save metadata, tags, and trigger FTS5 search indexing', () => {
    const itemId = dal.upsertItem({
      sha256Hash: 'hash-meta-test',
      filename: 'anya_heh.png',
      originalPath: '/curated/anya_heh.png',
      ext: '.png',
      mimeType: 'image/png',
      width: 400,
      height: 400,
      fileSizeBytes: 80000,
      isAnimated: false,
    });

    dal.saveMetadata({
      itemId,
      character: 'Anya Forger',
      sourceOrigin: 'Spy x Family',
      action: 'smug grin',
      feeling: 'mischievous smugness',
      description: 'Anya making her iconic smug face.',
      tags: ['anya', 'smug', 'heh', 'waku-waku'],
      customAttributes: { mood_level: '10' },
    });

    const item = dal.getItemById(itemId);
    expect(item?.metadata?.character).toBe('Anya Forger');
    expect(item?.metadata?.sourceOrigin).toBe('Spy x Family');
    expect(item?.tags).toContain('smug');
    expect(item?.tags).toContain('waku-waku');
    expect(item?.customAttributes.mood_level).toBe('10');

    // Test FTS search by character
    const resChar = dal.searchItems({ query: 'Anya' });
    expect(resChar.items).toHaveLength(1);
    expect(resChar.items[0].id).toBe(itemId);

    // Test FTS search by feeling
    const resFeeling = dal.searchItems({ query: 'mischievous' });
    expect(resFeeling.items).toHaveLength(1);

    // Test FTS search by tag prefix
    const resTag = dal.searchItems({ query: 'waku' });
    expect(resTag.items).toHaveLength(1);
  });

  it('should update FTS5 index when metadata is updated', () => {
    const itemId = dal.upsertItem({
      sha256Hash: 'hash-update-test',
      filename: 'cat.png',
      originalPath: '/curated/cat.png',
      ext: '.png',
      mimeType: 'image/png',
      width: 200,
      height: 200,
      fileSizeBytes: 20000,
      isAnimated: false,
    });

    dal.saveMetadata({
      itemId,
      character: 'Unknown Cat',
      sourceOrigin: 'Internet Memes',
      action: 'sleeping',
      feeling: 'peaceful',
      description: 'A sleeping cat.',
      tags: ['cat', 'sleepy'],
    });

    expect(dal.searchItems({ query: 'sleeping' }).total).toBe(1);

    // Update metadata
    dal.saveMetadata({
      itemId,
      action: 'screaming loudly',
      feeling: 'panicked',
      description: 'A cat screaming in terror.',
    });

    // Old action should no longer match
    expect(dal.searchItems({ query: 'sleeping' }).total).toBe(0);
    // New action should match
    expect(dal.searchItems({ query: 'screaming' }).total).toBe(1);
    expect(dal.searchItems({ query: 'panicked' }).total).toBe(1);
  });

  it('should handle favorites and usage tracking', () => {
    const itemId = dal.upsertItem({
      sha256Hash: 'hash-usage-test',
      filename: 'thumbs_up.png',
      originalPath: '/curated/thumbs_up.png',
      ext: '.png',
      mimeType: 'image/png',
      width: 300,
      height: 300,
      fileSizeBytes: 30000,
      isAnimated: false,
    });

    // Initial state
    let stats = dal.getUsageStats(itemId);
    expect(stats.isFavorite).toBe(false);
    expect(stats.copyCount).toBe(0);
    expect(stats.lastCopiedAt).toBeNull();

    // Toggle favorite
    const fav1 = dal.toggleFavorite(itemId);
    expect(fav1).toBe(true);
    expect(dal.getUsageStats(itemId).isFavorite).toBe(true);

    const fav2 = dal.toggleFavorite(itemId);
    expect(fav2).toBe(false);
    expect(dal.getUsageStats(itemId).isFavorite).toBe(false);

    // Record usage
    dal.recordItemUsage(itemId);
    stats = dal.getUsageStats(itemId);
    expect(stats.copyCount).toBe(1);
    expect(stats.lastCopiedAt).not.toBeNull();

    dal.recordItemUsage(itemId);
    expect(dal.getUsageStats(itemId).copyCount).toBe(2);
  });

  it('should filter items by recent, favorites, and all tabs', () => {
    const item1 = dal.upsertItem({
      sha256Hash: 'item-1',
      filename: 'item1.png',
      originalPath: '/curated/item1.png',
      ext: '.png',
      mimeType: 'image/png',
      width: 100,
      height: 100,
      fileSizeBytes: 1000,
      isAnimated: false,
    });

    const item2 = dal.upsertItem({
      sha256Hash: 'item-2',
      filename: 'item2.png',
      originalPath: '/curated/item2.png',
      ext: '.png',
      mimeType: 'image/png',
      width: 100,
      height: 100,
      fileSizeBytes: 1000,
      isAnimated: false,
    });

    dal.toggleFavorite(item1, true);
    dal.recordItemUsage(item2);

    // All tab
    const all = dal.searchItems({ tab: 'all' });
    expect(all.total).toBe(2);

    // Favorites tab
    const favs = dal.searchItems({ tab: 'favorites' });
    expect(favs.total).toBe(1);
    expect(favs.items[0].id).toBe(item1);

    // Recent tab
    const recents = dal.searchItems({ tab: 'recent' });
    expect(recents.total).toBe(1);
    expect(recents.items[0].id).toBe(item2);
  });
});
