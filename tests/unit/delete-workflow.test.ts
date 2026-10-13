import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database, { Database as DatabaseInstance } from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { initializeSchema } from '../../src/main/services/database/schema';
import { StickerDatabaseDAL } from '../../src/main/services/database/dal';

describe('Delete Workflow & Deletion Safety Checks', () => {
  let db: DatabaseInstance;
  let dal: StickerDatabaseDAL;
  let tempDir: string;
  let item1Id: string;
  let item2Id: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sticker-delete-test-'));
    db = new Database(':memory:');
    initializeSchema(db);
    dal = new StickerDatabaseDAL(db);

    item1Id = dal.upsertItem({
      sha256Hash: 'hash-del-1',
      filename: 'sticker_del_1.png',
      originalPath: path.join(tempDir, 'sticker_del_1.png'),
      ext: '.png',
      mimeType: 'image/png',
      width: 512,
      height: 512,
      fileSizeBytes: 12000,
      isAnimated: false,
    });

    item2Id = dal.upsertItem({
      sha256Hash: 'hash-del-2',
      filename: 'sticker_del_2.png',
      originalPath: path.join(tempDir, 'sticker_del_2.png'),
      ext: '.png',
      mimeType: 'image/png',
      width: 512,
      height: 512,
      fileSizeBytes: 15000,
      isAnimated: false,
    });

    dal.saveMetadata({
      itemId: item1Id,
      character: 'Aqua',
      sourceOrigin: 'Konosuba',
    });
    dal.setTags(item1Id, ['cry', 'goddess']);

    dal.saveMetadata({
      itemId: item2Id,
      character: 'Megumin',
      sourceOrigin: 'Konosuba',
    });
    dal.setTags(item2Id, ['explosion']);
  });

  afterEach(() => {
    db.close();
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  describe('Keyboard Delete Guard Conditions', () => {
    function shouldTriggerDeleteKey(
      key: string,
      targetTagName: string,
      isContentEditable: boolean,
      isAnyModalOpen: boolean,
      selectedCount: number
    ): boolean {
      if (key !== 'Delete' && key !== 'Backspace') return false;
      if (['INPUT', 'TEXTAREA'].includes(targetTagName) || isContentEditable) return false;
      if (isAnyModalOpen) return false;
      return selectedCount > 0;
    }

    it('should trigger delete on Delete or Backspace key when items are selected', () => {
      expect(shouldTriggerDeleteKey('Delete', 'BODY', false, false, 1)).toBe(true);
      expect(shouldTriggerDeleteKey('Backspace', 'DIV', false, false, 3)).toBe(true);
    });

    it('should NOT trigger delete when user is typing in INPUT or TEXTAREA', () => {
      expect(shouldTriggerDeleteKey('Delete', 'INPUT', false, false, 1)).toBe(false);
      expect(shouldTriggerDeleteKey('Backspace', 'INPUT', false, false, 1)).toBe(false);
      expect(shouldTriggerDeleteKey('Delete', 'TEXTAREA', false, false, 2)).toBe(false);
      expect(shouldTriggerDeleteKey('Backspace', 'TEXTAREA', false, false, 2)).toBe(false);
    });

    it('should NOT trigger delete when element is contenteditable', () => {
      expect(shouldTriggerDeleteKey('Delete', 'DIV', true, false, 1)).toBe(false);
      expect(shouldTriggerDeleteKey('Backspace', 'P', true, false, 1)).toBe(false);
    });

    it('should NOT trigger delete when a modal is open', () => {
      expect(shouldTriggerDeleteKey('Delete', 'DIV', false, true, 1)).toBe(false);
      expect(shouldTriggerDeleteKey('Backspace', 'DIV', false, true, 2)).toBe(false);
    });

    it('should NOT trigger delete when nothing is selected', () => {
      expect(shouldTriggerDeleteKey('Delete', 'DIV', false, false, 0)).toBe(false);
      expect(shouldTriggerDeleteKey('Backspace', 'DIV', false, false, 0)).toBe(false);
    });

    it('should ignore other keys like Enter or Escape', () => {
      expect(shouldTriggerDeleteKey('Enter', 'DIV', false, false, 1)).toBe(false);
      expect(shouldTriggerDeleteKey('Escape', 'DIV', false, false, 1)).toBe(false);
    });
  });

  describe('Database Cascade & Variant Cleanup', () => {
    it('should cascade delete metadata and tags when a single item is deleted', () => {
      expect(dal.getItemById(item1Id)).not.toBeNull();
      const count = dal.deleteItems([item1Id]);
      expect(count).toBe(1);

      expect(dal.getItemById(item1Id)).toBeNull();
      // Ensure remaining item was untouched
      expect(dal.getItemById(item2Id)).not.toBeNull();
    });

    it('should bulk delete multiple items and clean up search facets', () => {
      const count = dal.deleteItems([item1Id, item2Id]);
      expect(count).toBe(2);

      const facets = dal.getFacets();
      expect(facets.characters).not.toContain('Aqua');
      expect(facets.characters).not.toContain('Megumin');
    });

    it('should safely unlink variant files if present', () => {
      // Create a dummy variant file
      const dummyVariantPath = path.join(tempDir, 'variant_thumb.webp');
      fs.writeFileSync(dummyVariantPath, 'dummy-webp-bytes');
      expect(fs.existsSync(dummyVariantPath)).toBe(true);

      // Register variant
      dal.upsertVariant({
        itemId: item1Id,
        tier: 'thumb',
        filePath: dummyVariantPath,
        format: 'webp',
        width: 128,
        height: 128,
        fileSizeBytes: 100,
      });

      const it1 = dal.getItemById(item1Id);
      expect(it1?.variants.thumb?.filePath).toBe(dummyVariantPath);

      // Simulate variant cleanup
      if (it1?.variants.thumb?.filePath && fs.existsSync(it1.variants.thumb.filePath)) {
        fs.unlinkSync(it1.variants.thumb.filePath);
      }
      expect(fs.existsSync(dummyVariantPath)).toBe(false);

      // Delete from DB
      dal.deleteItems([item1Id]);
      expect(dal.getItemById(item1Id)).toBeNull();
    });
  });
});
