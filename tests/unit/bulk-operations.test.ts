import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database, { Database as DatabaseInstance } from 'better-sqlite3';
import { initializeSchema } from '../../src/main/services/database/schema';
import { StickerDatabaseDAL } from '../../src/main/services/database/dal';

describe('Bulk Operations DAL', () => {
  let db: DatabaseInstance;
  let dal: StickerDatabaseDAL;
  let item1Id: string;
  let item2Id: string;

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    dal = new StickerDatabaseDAL(db);

    item1Id = dal.upsertItem({
      sha256Hash: 'hash1',
      filename: 'sticker1.png',
      originalPath: '/vault/sticker1.png',
      ext: '.png',
      mimeType: 'image/png',
      width: 256,
      height: 256,
      fileSizeBytes: 1000,
      isAnimated: false,
    });

    item2Id = dal.upsertItem({
      sha256Hash: 'hash2',
      filename: 'sticker2.png',
      originalPath: '/vault/sticker2.png',
      ext: '.png',
      mimeType: 'image/png',
      width: 256,
      height: 256,
      fileSizeBytes: 2000,
      isAnimated: false,
    });
  });

  afterEach(() => {
    db.close();
  });

  it('should bulk add and remove tags across multiple items', () => {
    dal.bulkAddTags([item1Id, item2Id], ['anime', 'cute', 'reaction']);

    const it1 = dal.getItemById(item1Id);
    const it2 = dal.getItemById(item2Id);

    expect(it1?.tags).toEqual(expect.arrayContaining(['anime', 'cute', 'reaction']));
    expect(it2?.tags).toEqual(expect.arrayContaining(['anime', 'cute', 'reaction']));

    dal.bulkRemoveTags([item1Id, item2Id], ['reaction']);

    const it1After = dal.getItemById(item1Id);
    const it2After = dal.getItemById(item2Id);

    expect(it1After?.tags).not.toContain('reaction');
    expect(it2After?.tags).not.toContain('reaction');
    expect(it1After?.tags).toContain('anime');
  });

  it('should bulk toggle favorite status', () => {
    dal.bulkToggleFavorite([item1Id, item2Id], true);

    expect(dal.getItemById(item1Id)?.usage.isFavorite).toBe(true);
    expect(dal.getItemById(item2Id)?.usage.isFavorite).toBe(true);

    dal.bulkToggleFavorite([item1Id, item2Id], false);
    expect(dal.getItemById(item1Id)?.usage.isFavorite).toBe(false);
    expect(dal.getItemById(item2Id)?.usage.isFavorite).toBe(false);
  });

  it('should bulk set custom attributes like rating and nsfw', () => {
    dal.bulkSetCustomAttribute([item1Id, item2Id], 'rating', '5');
    dal.bulkSetCustomAttribute([item1Id, item2Id], 'nsfw', 'true');

    const it1 = dal.getItemById(item1Id);
    const it2 = dal.getItemById(item2Id);

    expect(it1?.customAttributes['rating']).toBe('5');
    expect(it1?.customAttributes['nsfw']).toBe('true');
    expect(it2?.customAttributes['rating']).toBe('5');
    expect(it2?.customAttributes['nsfw']).toBe('true');
  });

  it('should bulk delete items in a single transaction', () => {
    const deletedCount = dal.deleteItems([item1Id, item2Id]);
    expect(deletedCount).toBe(2);

    expect(dal.getItemById(item1Id)).toBeNull();
    expect(dal.getItemById(item2Id)).toBeNull();
  });
});
