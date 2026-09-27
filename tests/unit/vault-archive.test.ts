import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import AdmZip from 'adm-zip';
import Database from 'better-sqlite3';
import { initializeSchema } from '../../src/main/services/database/schema';
import { StickerDatabaseDAL, setDatabaseDAL } from '../../src/main/services/database/dal';
import { setCustomVaultRoot, ensureVaultDirectories } from '../../src/main/services/ingestion/paths';
import { createVaultBackup } from '../../src/main/services/export/vault-backup';
import { restoreVaultBackup } from '../../src/main/services/export/vault-restore';
import { exportStickerPack } from '../../src/main/services/export/pack-exporter';

describe('Vault Backup, Restore & Pack Export Archiver', () => {
  const tempTestDir = path.join(os.tmpdir(), `sticker-test-vault-archive-${Date.now()}`);
  const vaultDir = path.join(tempTestDir, 'vault');
  const dbPath = path.join(tempTestDir, 'test.db');
  let db: any;
  let dal: StickerDatabaseDAL;

  beforeAll(() => {
    fs.mkdirSync(vaultDir, { recursive: true });
    setCustomVaultRoot(vaultDir);
    ensureVaultDirectories();

    db = new Database(dbPath);
    initializeSchema(db);
    dal = new StickerDatabaseDAL(db);
    setDatabaseDAL(dal);
  });

  afterAll(() => {
    try {
      setDatabaseDAL(null);
      db.close();
      if (fs.existsSync(tempTestDir)) {
        fs.rmSync(tempTestDir, { recursive: true, force: true });
      }
    } catch {
      // Ignore
    }
  });

  it('should create a valid .stickervault archive containing manifest, db snapshot, and images', async () => {
    // 1. Create a dummy source sticker and variant
    const dummySource = path.join(vaultDir, 'sources', 'test-sticker.png');
    fs.writeFileSync(dummySource, Buffer.from('FAKE_PNG_BINARY_DATA'));

    const dummyVariant = path.join(vaultDir, '.stickerchest', 'variants', 'thumb', 'testhash.webp');
    fs.writeFileSync(dummyVariant, Buffer.from('FAKE_WEBP_THUMB_DATA'));

    const itemId = dal.upsertItem({
      id: 'item-test-uuid-001',
      sha256Hash: 'testhash',
      filename: 'test-sticker.png',
      originalPath: dummySource,
      ext: '.png',
      mimeType: 'image/png',
      width: 512,
      height: 512,
      fileSizeBytes: 20,
      isAnimated: false,
    });

    dal.upsertVariant({
      itemId,
      tier: 'thumb',
      filePath: dummyVariant,
      format: 'webp',
      width: 96,
      height: 96,
      fileSizeBytes: 20,
    });

    dal.saveMetadata({
      itemId,
      character: 'Rem',
      sourceOrigin: 'Re:Zero',
      feeling: 'happy',
    });

    dal.setTags(itemId, ['anime', 'maid', 'blue-hair'], false);

    // 2. Export backup
    const backupFile = path.join(tempTestDir, 'backup.stickervault');
    const result = await createVaultBackup(backupFile, undefined, dal);

    expect(result.success).toBe(true);
    expect(result.totalItems).toBeGreaterThanOrEqual(1);
    expect(fs.existsSync(backupFile)).toBe(true);

    // 3. Inspect archive contents
    const zip = new AdmZip(backupFile);
    expect(zip.getEntry('manifest.json')).not.toBeNull();
    expect(zip.getEntry('database.sqlite')).not.toBeNull();
    expect(zip.getEntry('sources/test-sticker.png')).not.toBeNull();
    expect(zip.getEntry('variants/thumb/testhash.webp')).not.toBeNull();

    const manifest = JSON.parse(zip.getEntry('manifest.json')!.getData().toString('utf-8'));
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.items.length).toBeGreaterThanOrEqual(1);
    expect(manifest.items[0].sha256Hash).toBe('testhash');
    expect(manifest.items[0].tags).toContain('anime');
  });

  it('should restore from backup archive with conflict resolution', async () => {
    const backupFile = path.join(tempTestDir, 'backup.stickervault');

    // Restore with 'skip' (should skip existing testhash)
    const skipRes = await restoreVaultBackup({
      backupFilePath: backupFile,
      conflictResolution: 'skip',
    }, undefined, dal);
    expect(skipRes.skipped).toBeGreaterThanOrEqual(1);

    // Restore with 'merge' (should merge tags)
    const mergeRes = await restoreVaultBackup({
      backupFilePath: backupFile,
      conflictResolution: 'merge',
    }, undefined, dal);
    expect(mergeRes.overwritten).toBeGreaterThanOrEqual(1);

    // Verify item in DB still has tags
    const item = dal.getItemByHash('testhash');
    expect(item).not.toBeNull();
    expect(item?.tags).toContain('anime');
  });

  it('should export third-party sticker pack with platform-specific metadata', async () => {
    const packZip = path.join(tempTestDir, 'telegram-pack.zip');
    const item = dal.getItemByHash('testhash');

    // Create real small image for converter to process
    const realSource = path.join(vaultDir, 'sources', 'test-real.png');
    const sharp = (await import('sharp')).default;
    await sharp({
      create: { width: 100, height: 100, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 1 } },
    })
      .png()
      .toFile(realSource);

    const realId = dal.upsertItem({
      id: 'item-real-uuid-002',
      sha256Hash: 'realhash',
      filename: 'test-real.png',
      originalPath: realSource,
      ext: '.png',
      mimeType: 'image/png',
      width: 100,
      height: 100,
      fileSizeBytes: 500,
      isAnimated: false,
    });

    const exportRes = await exportStickerPack({
      platform: 'telegram',
      itemIds: [realId],
      outputZipPath: packZip,
      packTitle: 'Test Pack',
      packAuthor: 'Antigravity',
    }, undefined, dal);

    expect(exportRes.success).toBe(true);
    expect(exportRes.totalExported).toBe(1);
    expect(fs.existsSync(packZip)).toBe(true);

    const zip = new AdmZip(packZip);
    expect(zip.getEntry('pack-info.json')).not.toBeNull();
    const info = JSON.parse(zip.getEntry('pack-info.json')!.getData().toString('utf-8'));
    expect(info.platform).toBe('telegram');
    expect(info.packTitle).toBe('Test Pack');
  });
});
