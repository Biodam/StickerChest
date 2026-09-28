import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import os from 'os';
import { getDatabase, getDatabasePath, switchDatabase, closeDatabase } from '../database/connection';
import { getDatabaseDAL, StickerDatabaseDAL, setDatabaseDAL } from '../database/dal';
import { GDriveClient } from './gdrive-client';

export interface SyncManifest {
  version: string;
  timestamp: number;
  deviceId: string;
  itemCount: number;
  dbSha256: string;
}

const MANIFEST_NAME = 'sync-manifest.json';
const DB_SNAPSHOT_NAME = 'stickers-snapshot.sqlite';

function calculateFileSha256(filePath: string): string {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

export class DbSyncCoordinator {
  constructor(private client: GDriveClient) {}

  public getDeviceId(): string {
    return `${os.hostname()}-${os.platform()}`;
  }

  public async exportLocalSnapshot(
    destPath: string,
    customDal?: StickerDatabaseDAL
  ): Promise<{ snapshotPath: string; manifest: SyncManifest }> {
    const dal = customDal || getDatabaseDAL();
    const db = (dal as any).db || getDatabase();

    const dir = path.dirname(destPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await db.backup(destPath);
    const dbSha256 = calculateFileSha256(destPath);
    const { total } = dal.searchItems({ limit: 1 });

    const manifest: SyncManifest = {
      version: '1.0.0',
      timestamp: Date.now(),
      deviceId: this.getDeviceId(),
      itemCount: total,
      dbSha256,
    };

    return { snapshotPath: destPath, manifest };
  }

  public async getRemoteManifest(accessToken: string): Promise<SyncManifest | null> {
    try {
      const files = await this.client.listFiles(accessToken);
      const manifestFile = files.find((f) => f.name === MANIFEST_NAME);
      if (!manifestFile) return null;

      const buffer = await this.client.downloadFile(accessToken, manifestFile.id);
      return JSON.parse(buffer.toString('utf8')) as SyncManifest;
    } catch (err) {
      console.error('Failed to read remote sync manifest:', err);
      return null;
    }
  }

  public async uploadSnapshot(
    accessToken: string,
    customDal?: StickerDatabaseDAL
  ): Promise<SyncManifest> {
    const tempDir = os.tmpdir();
    const tempDbPath = path.join(tempDir, `gdrive_sync_out_${Date.now()}.sqlite`);

    try {
      const { snapshotPath, manifest } = await this.exportLocalSnapshot(tempDbPath, customDal);
      const snapshotBuffer = fs.readFileSync(snapshotPath);
      const manifestBuffer = Buffer.from(JSON.stringify(manifest, null, 2), 'utf8');

      // Remove existing remote snapshot and manifest
      const existing = await this.client.listFiles(accessToken);
      for (const file of existing) {
        if (file.name === DB_SNAPSHOT_NAME || file.name === MANIFEST_NAME) {
          await this.client.deleteFile(accessToken, file.id);
        }
      }

      await this.client.uploadFile(accessToken, DB_SNAPSHOT_NAME, snapshotBuffer, 'application/x-sqlite3', {
        type: 'database-snapshot',
        sha256: manifest.dbSha256,
      });

      await this.client.uploadFile(accessToken, MANIFEST_NAME, manifestBuffer, 'application/json', {
        type: 'sync-manifest',
      });

      return manifest;
    } finally {
      if (fs.existsSync(tempDbPath)) {
        try { fs.unlinkSync(tempDbPath); } catch {}
      }
    }
  }

  public async downloadAndApplySnapshot(
    accessToken: string,
    remoteManifest: SyncManifest
  ): Promise<boolean> {
    const files = await this.client.listFiles(accessToken);
    const dbFile = files.find((f) => f.name === DB_SNAPSHOT_NAME);
    if (!dbFile) {
      throw new Error('Remote database snapshot file not found on Google Drive');
    }

    const tempDir = os.tmpdir();
    const tempDownloaded = path.join(tempDir, `gdrive_sync_in_${Date.now()}.sqlite`);

    try {
      const buffer = await this.client.downloadFile(accessToken, dbFile.id);
      fs.writeFileSync(tempDownloaded, buffer);

      const downloadedSha256 = calculateFileSha256(tempDownloaded);
      if (downloadedSha256 !== remoteManifest.dbSha256) {
        throw new Error('Downloaded database snapshot checksum does not match manifest');
      }

      // Safe database swap
      const currentDbPath = getDatabasePath();
      closeDatabase();

      if (fs.existsSync(currentDbPath)) {
        fs.copyFileSync(currentDbPath, `${currentDbPath}.prev_sync_backup`);
      }

      fs.copyFileSync(tempDownloaded, currentDbPath);
      switchDatabase(currentDbPath);
      setDatabaseDAL(new StickerDatabaseDAL());

      return true;
    } finally {
      if (fs.existsSync(tempDownloaded)) {
        try { fs.unlinkSync(tempDownloaded); } catch {}
      }
    }
  }
}
