import { describe, it, expect } from 'vitest';
import { getAboutInfo } from '../../src/main/services/app-info/about-service';

describe('AboutService', () => {
  it('should return system and application metadata with expected fields', () => {
    const info = getAboutInfo();

    expect(info).toBeDefined();
    expect(info.appName).toBe('Sticker Chest');
    expect(typeof info.version).toBe('string');
    expect(typeof info.commitHash).toBe('string');
    expect(typeof info.platform).toBe('string');
    expect(typeof info.arch).toBe('string');
    expect(typeof info.osRelease).toBe('string');
    expect(typeof info.nodeVersion).toBe('string');
    expect(typeof info.vaultPath).toBe('string');
    expect(typeof info.databasePath).toBe('string');
    expect(typeof info.totalStickers).toBe('number');
    expect(info.totalStickers).toBeGreaterThanOrEqual(0);
  });
});
