import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Database from 'better-sqlite3';
import { ImageSyncWorker } from '../../src/main/services/sync/image-sync-worker';
import { DbSyncCoordinator } from '../../src/main/services/sync/db-sync-coordinator';
import { GDriveClient, GDriveFile } from '../../src/main/services/sync/gdrive-client';
import { setCustomVaultRoot, ensureVaultDirectories } from '../../src/main/services/ingestion/paths';
import { StickerDatabaseDAL } from '../../src/main/services/database/dal';
import { initializeSchema } from '../../src/main/services/database/schema';

describe('Google Drive Sync Coordination', () => {
  let tempDir: string;
  let mockClient: GDriveClient;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gdrive-sync-test-'));
    setCustomVaultRoot(tempDir);
    ensureVaultDirectories();

    mockClient = {
      listFiles: vi.fn().mockResolvedValue([]),
      uploadFile: vi.fn().mockResolvedValue({ id: 'mock-upload-id' }),
      downloadFile: vi.fn().mockResolvedValue(Buffer.from('mock-download-data')),
      deleteFile: vi.fn().mockResolvedValue(true),
      getStorageQuota: vi.fn().mockResolvedValue({ usedBytes: 100, totalBytes: 1000 }),
    } as any;
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    }
  });

  it('ImageSyncWorker: should upload missing local images to Google Drive', async () => {
    const stickerDir = path.join(tempDir, '.stickerchest', 'variants', 'sticker');
    fs.mkdirSync(stickerDir, { recursive: true });
    fs.writeFileSync(path.join(stickerDir, 'hash1.webp'), Buffer.from('fake-webp-1'));

    const worker = new ImageSyncWorker(mockClient);
    const progressUpdates: any[] = [];

    const result = await worker.syncImages('mock-token', (p) => progressUpdates.push(p));

    expect(result.uploaded).toBe(1);
    expect(result.downloaded).toBe(0);
    expect(mockClient.uploadFile).toHaveBeenCalledWith(
      'mock-token',
      'img_sticker_hash1.webp',
      expect.any(Buffer),
      'image/webp',
      { type: 'variant', tier: 'sticker' }
    );
    expect(progressUpdates.length).toBeGreaterThan(0);
  });

  it('ImageSyncWorker: should download missing remote images locally', async () => {
    const remoteFiles: GDriveFile[] = [
      {
        id: 'remote-file-id-456',
        name: 'img_emoji_remotehash99.webp',
        mimeType: 'image/webp',
        appProperties: { type: 'variant', tier: 'emoji' },
      },
    ];

    (mockClient.listFiles as any).mockResolvedValueOnce(remoteFiles);
    (mockClient.downloadFile as any).mockResolvedValueOnce(Buffer.from('remote-downloaded-bytes'));

    const worker = new ImageSyncWorker(mockClient);
    const result = await worker.syncImages('mock-token');

    expect(result.downloaded).toBe(1);
    expect(mockClient.downloadFile).toHaveBeenCalledWith('mock-token', 'remote-file-id-456');

    const expectedLocalPath = path.join(tempDir, '.stickerchest', 'variants', 'emoji', 'remotehash99.webp');
    expect(fs.existsSync(expectedLocalPath)).toBe(true);
    expect(fs.readFileSync(expectedLocalPath).toString()).toBe('remote-downloaded-bytes');
  });

  it('DbSyncCoordinator: should export local database snapshot and generate valid manifest', async () => {
    const testDbPath = path.join(tempDir, 'test.db');
    const db = new Database(testDbPath);
    initializeSchema(db);
    const dal = new StickerDatabaseDAL(db);

    const coordinator = new DbSyncCoordinator(mockClient);
    const exportPath = path.join(tempDir, 'export_snapshot.sqlite');

    const { snapshotPath, manifest } = await coordinator.exportLocalSnapshot(exportPath, dal);

    expect(fs.existsSync(snapshotPath)).toBe(true);
    expect(manifest.version).toBe('1.0.0');
    expect(manifest.dbSha256).toBeDefined();
    expect(manifest.dbSha256.length).toBe(64); // SHA-256 hex string
    expect(manifest.itemCount).toBe(0);

    db.close();
  });

  it('DbSyncCoordinator: should upload database snapshot and manifest to Google Drive', async () => {
    const testDbPath = path.join(tempDir, 'test_up.db');
    const db = new Database(testDbPath);
    initializeSchema(db);
    const dal = new StickerDatabaseDAL(db);

    const coordinator = new DbSyncCoordinator(mockClient);
    const manifest = await coordinator.uploadSnapshot('mock-token', dal);

    expect(manifest).toBeDefined();
    expect(mockClient.uploadFile).toHaveBeenCalledWith(
      'mock-token',
      'stickers-snapshot.sqlite',
      expect.any(Buffer),
      'application/x-sqlite3',
      expect.any(Object)
    );
    expect(mockClient.uploadFile).toHaveBeenCalledWith(
      'mock-token',
      'sync-manifest.json',
      expect.any(Buffer),
      'application/json',
      expect.any(Object)
    );

    db.close();
  });
});
