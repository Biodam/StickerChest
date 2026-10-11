import { describe, it, expect } from 'vitest';
import { updateManifest } from '../../scripts/update-scoop-manifest.js';

describe('updateManifest', () => {
  const base = {
    version: '0.0.7',
    description: 'x',
    architecture: { '64bit': { url: 'old', hash: 'oldhash' } },
    shortcuts: [['Sticker.Chest.0.0.7.exe', 'Sticker Chest']],
    checkver: 'github',
  };

  it('updates version, url, hash and shortcut, preserving other fields', () => {
    const out = updateManifest(base, '0.0.9', 'abc123');
    expect(out.version).toBe('0.0.9');
    expect(out.architecture['64bit'].url).toBe('https://github.com/Biodam/StickerChest/releases/download/v0.0.9/Sticker.Chest.0.0.9.exe');
    expect(out.architecture['64bit'].hash).toBe('abc123');
    expect(out.shortcuts).toEqual([['Sticker.Chest.0.0.9.exe', 'Sticker Chest']]);
    expect(out.checkver).toBe('github');
  });

  it('does not mutate the input', () => {
    updateManifest(base, '0.0.9', 'abc123');
    expect(base.version).toBe('0.0.7');
  });
});
