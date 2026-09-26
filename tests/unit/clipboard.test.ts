import { describe, it, expect, vi, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeSchema } from '../../src/main/services/database/schema';
import { StickerDatabaseDAL } from '../../src/main/services/database/dal';

describe('Clipboard Dispatcher & Usage Recording', () => {
  let db: any;
  let dal: StickerDatabaseDAL;

  beforeEach(() => {
    db = new Database(':memory:');
    initializeSchema(db);
    dal = new StickerDatabaseDAL(db);
  });

  it('should increment copyCount and update lastCopiedAt when item usage is recorded', () => {
    const itemId = dal.upsertItem({
      sha256Hash: 'clip-test-hash',
      filename: 'cat_reaction.png',
      originalPath: '/curated/cat_reaction.png',
      ext: '.png',
      mimeType: 'image/png',
      width: 400,
      height: 400,
      fileSizeBytes: 40000,
      isAnimated: false,
    });

    const initialUsage = dal.getUsageStats(itemId);
    expect(initialUsage.copyCount).toBe(0);
    expect(initialUsage.lastCopiedAt).toBeNull();

    // Record copy
    dal.recordItemUsage(itemId);

    const updatedUsage = dal.getUsageStats(itemId);
    expect(updatedUsage.copyCount).toBe(1);
    expect(updatedUsage.lastCopiedAt).not.toBeNull();

    // Verify item now appears at the top of Recent tab
    const recent = dal.searchItems({ tab: 'recent' });
    expect(recent.total).toBe(1);
    expect(recent.items[0].id).toBe(itemId);
  });

  it('should rank recently copied items first in recent tab', async () => {
    const item1 = dal.upsertItem({
      sha256Hash: 'hash-first',
      filename: 'first.png',
      originalPath: '/curated/first.png',
      ext: '.png',
      mimeType: 'image/png',
      width: 200,
      height: 200,
      fileSizeBytes: 20000,
      isAnimated: false,
    });

    const item2 = dal.upsertItem({
      sha256Hash: 'hash-second',
      filename: 'second.png',
      originalPath: '/curated/second.png',
      ext: '.png',
      mimeType: 'image/png',
      width: 200,
      height: 200,
      fileSizeBytes: 20000,
      isAnimated: false,
    });

    dal.recordItemUsage(item1);
    await new Promise((r) => setTimeout(r, 10));
    dal.recordItemUsage(item2);

    const recents = dal.searchItems({ tab: 'recent' });
    expect(recents.items[0].id).toBe(item2);
    expect(recents.items[1].id).toBe(item1);
  });
});
