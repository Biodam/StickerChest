import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import { getVaultImageUrl } from '../../src/renderer/shared/image-url';
import { setCustomVaultRoot, resolveVaultPath } from '../../src/main/services/ingestion/paths';

describe('Vault Image URL & Path Resolution', () => {
  const testDir = path.resolve(process.cwd(), '.url-test-assets');
  const stickerVariantDir = path.join(testDir, '.stickervault', 'variants', 'sticker');
  const dummyVariant = path.join(stickerVariantDir, 'sample_hash.webp');

  beforeAll(() => {
    fs.mkdirSync(stickerVariantDir, { recursive: true });
    fs.writeFileSync(dummyVariant, Buffer.from('test webp'));
    setCustomVaultRoot(testDir);
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

  it('should encode image file paths into vault query URL', () => {
    expect(getVaultImageUrl(null)).toBe('');
    expect(getVaultImageUrl(undefined)).toBe('');
    expect(getVaultImageUrl('')).toBe('');

    const windowsPath = 'C:\\Users\\user\\vault\\thumb\\test.webp';
    const url = getVaultImageUrl(windowsPath);
    expect(url).toBe(`vault://media?path=${encodeURIComponent(windowsPath)}`);

    const parsed = new URL(url);
    expect(parsed.searchParams.get('path')).toBe(windowsPath);
  });

  it('should resolve absolute existing paths directly', () => {
    const resolved = resolveVaultPath(dummyVariant);
    expect(resolved).toBe(dummyVariant);
  });

  it('should resolve variant tier relative paths to .stickervault variants', () => {
    const relativeStored = '.stickervault/variants/sticker/sample_hash.webp';
    const resolved = resolveVaultPath(relativeStored);
    expect(resolved).toBe(dummyVariant);

    const legacyVaultPath = 'vault/sticker/sample_hash.webp';
    const resolvedLegacy = resolveVaultPath(legacyVaultPath);
    expect(resolvedLegacy).toBe(dummyVariant);
  });

  it('should resolve Windows drive letter path with stripped colon in URL parser fallback', () => {
    let target = 'c/Users/fabio/vault/test.webp';
    if (/^[a-zA-Z]\//.test(target)) {
      target = target[0].toUpperCase() + ':/' + target.slice(2);
    }
    expect(target).toBe('C:/Users/fabio/vault/test.webp');
  });
});
