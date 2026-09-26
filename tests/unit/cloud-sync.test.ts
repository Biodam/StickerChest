import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { isCloudDrivePath, waitUntilFileStable } from '../../src/main/services/ingestion/cloud-sync-helper';
import { IngestionService } from '../../src/main/services/ingestion/folder-watcher';

describe('Cloud Drive Compatibility & Periodic Sync', () => {
  const testDir = path.resolve(process.cwd(), '.cloud-test-assets');
  const tempStableFile = path.join(testDir, 'stable_image.png');

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    fs.writeFileSync(tempStableFile, Buffer.from('fake image content'));
  });

  afterAll(() => {
    try {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    } catch {
      // Best effort cleanup
    }
  });

  it('should identify Google Drive and cloud virtual drive paths', () => {
    expect(isCloudDrivePath('G:\\My Drive\\Stickers')).toBe(true);
    expect(isCloudDrivePath('C:\\Users\\user\\Google Drive\\Reactions')).toBe(true);
    expect(isCloudDrivePath('/Users/user/Library/CloudStorage/GoogleDrive-me@gmail.com/My Drive')).toBe(true);
    expect(isCloudDrivePath('C:\\Users\\user\\OneDrive\\Pictures')).toBe(true);
    expect(isCloudDrivePath('C:\\LocalProjects\\RegularFolder')).toBe(false);
  });

  it('should verify file stability for ready files', async () => {
    const isReady = await waitUntilFileStable(tempStableFile, 1000, 100);
    expect(isReady).toBe(true);
  });

  it('should report false for non-existent files within timeout', async () => {
    const fakePath = path.join(testDir, 'does_not_exist.png');
    const isReady = await waitUntilFileStable(fakePath, 300, 50);
    expect(isReady).toBe(false);
  });

  it('should configure periodic sync interval in IngestionService', () => {
    const service = new IngestionService();
    service.startWatching(testDir, 30);
    expect(service.getWatchedPath()).toBe(testDir);

    service.setPeriodicInterval(15);
    service.stopWatching();
    expect(service.getWatchedPath()).toBeNull();
  });
});
