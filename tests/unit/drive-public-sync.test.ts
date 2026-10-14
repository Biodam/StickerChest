import { describe, it, expect } from 'vitest';
import { parseDriveFolderId } from '../../src/main/services/sync/folder-link-parser';
import { computeDownloads, sanitizeFilename, METADATA_FILENAME } from '../../src/main/services/sync/sync-diff';

describe('parseDriveFolderId', () => {
  const id = '1AbCdEfGhIjKlMnOpQrStUvWxYz_-012';
  it('parses folder share links', () => {
    expect(parseDriveFolderId(`https://drive.google.com/drive/folders/${id}?usp=sharing`)).toBe(id);
    expect(parseDriveFolderId(`https://drive.google.com/drive/u/0/folders/${id}`)).toBe(id);
  });
  it('parses open?id links and raw ids', () => {
    expect(parseDriveFolderId(`https://drive.google.com/open?id=${id}`)).toBe(id);
    expect(parseDriveFolderId(id)).toBe(id);
  });
  it('rejects invalid input', () => {
    expect(parseDriveFolderId('')).toBeNull();
    expect(parseDriveFolderId('https://example.com/folders/abc')).toBeNull();
    expect(parseDriveFolderId('not a link!')).toBeNull();
  });
});

describe('computeDownloads', () => {
  const f = (name: string, md5 = 'a', mimeType = 'image/png') => ({ id: name, name, mimeType, md5Checksum: md5 });
  it('downloads new and changed images, skips unchanged, folders and unsupported files', () => {
    const remote = [f('a.png'), f('b.png', 'new'), f('d.avif', 'new'), f('c.txt'), f('sub', 'x', 'application/vnd.google-apps.folder'), f(METADATA_FILENAME, 'm', 'application/json')];
    const ledger = { 'a.png': 'a', 'b.png': 'old' };
    const names = computeDownloads(remote, ledger, () => true).map((x) => x.name);
    expect(names).toEqual(['b.png', 'd.avif', METADATA_FILENAME]);
  });
  it('re-downloads files deleted locally', () => {
    const names = computeDownloads([f('a.png')], { 'a.png': 'a' }, () => false).map((x) => x.name);
    expect(names).toEqual(['a.png']);
  });
  it('sanitizes names', () => {
    expect(sanitizeFilename('../evil:name?.png')).toBe('evil_name_.png');
  });
});
