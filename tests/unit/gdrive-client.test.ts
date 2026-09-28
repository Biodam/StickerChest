import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GDriveClient } from '../../src/main/services/sync/gdrive-client';

describe('GDriveClient REST API', () => {
  let client: GDriveClient;

  beforeEach(() => {
    client = new GDriveClient();
    vi.restoreAllMocks();
  });

  it('should fetch storage quota from Google Drive API', async () => {
    const mockResponse = {
      storageQuota: {
        usage: '1073741824', // 1 GB
        limit: '16106127360', // 15 GB
      },
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as any);

    const quota = await client.getStorageQuota('mock-access-token');
    expect(quota.usedBytes).toBe(1073741824);
    expect(quota.totalBytes).toBe(16106127360);
  });

  it('should list files in appDataFolder with pagination', async () => {
    const page1 = {
      files: [
        { id: 'file1', name: 'img_sticker_123.webp', mimeType: 'image/webp' },
      ],
      nextPageToken: 'page2-token',
    };

    const page2 = {
      files: [
        { id: 'file2', name: 'sync-manifest.json', mimeType: 'application/json' },
      ],
    };

    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page1,
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => page2,
      } as any);

    const files = await client.listFiles('mock-token');
    expect(files).toHaveLength(2);
    expect(files[0].id).toBe('file1');
    expect(files[1].id).toBe('file2');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it('should upload a file using multipart body to appDataFolder', async () => {
    const uploadResult = {
      id: 'uploaded-file-id-123',
      name: 'img_sticker_abc.webp',
      mimeType: 'image/webp',
    };

    let capturedUrl = '';
    let capturedHeaders: any = {};
    let capturedBody: any = null;

    vi.spyOn(globalThis, 'fetch').mockImplementationOnce(async (url, init: any) => {
      capturedUrl = url.toString();
      capturedHeaders = init?.headers;
      capturedBody = init?.body;
      return {
        ok: true,
        json: async () => uploadResult,
      } as any;
    });

    const content = Buffer.from('mock-webp-bytes');
    const res = await client.uploadFile('mock-token', 'img_sticker_abc.webp', content, 'image/webp', {
      type: 'variant',
      tier: 'sticker',
    });

    expect(res.id).toBe('uploaded-file-id-123');
    expect(capturedUrl).toContain('uploadType=multipart');
    expect(capturedHeaders['Authorization']).toBe('Bearer mock-token');
    expect(capturedHeaders['Content-Type']).toContain('multipart/related');
    expect(capturedBody.toString()).toContain('img_sticker_abc.webp');
    expect(capturedBody.toString()).toContain('appDataFolder');
  });

  it('should download a file as Buffer', async () => {
    const text = 'hello-world-binary-content';
    const arrayBuf = new TextEncoder().encode(text).buffer;
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => arrayBuf,
    } as any);

    const buffer = await client.downloadFile('mock-token', 'file-id-xyz');
    expect(buffer.toString('utf8')).toBe(text);
  });

  it('should delete a file by ID', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 204,
    } as any);

    const success = await client.deleteFile('mock-token', 'file-id-to-delete');
    expect(success).toBe(true);
  });
});
