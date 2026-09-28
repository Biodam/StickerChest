export interface GDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  md5Checksum?: string;
  appProperties?: Record<string, string>;
}

export interface StorageQuota {
  usedBytes: number;
  totalBytes: number;
}

const GDRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const GDRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export class GDriveClient {
  public async getStorageQuota(accessToken: string): Promise<StorageQuota> {
    const res = await fetch(`${GDRIVE_API_BASE}/about?fields=storageQuota`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch storage quota: ${res.statusText}`);
    const data = await res.json();
    return {
      usedBytes: parseInt(data.storageQuota?.usage || '0', 10),
      totalBytes: parseInt(data.storageQuota?.limit || '16106127360', 10), // Default 15 GB
    };
  }

  public async listFiles(accessToken: string, query?: string): Promise<GDriveFile[]> {
    const files: GDriveFile[] = [];
    let pageToken: string | undefined = undefined;

    do {
      const url = new URL(`${GDRIVE_API_BASE}/files`);
      url.searchParams.set('spaces', 'appDataFolder');
      url.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType, size, modifiedTime, md5Checksum, appProperties)');
      url.searchParams.set('pageSize', '1000');
      if (query) {
        url.searchParams.set('q', query);
      }

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`GDrive listFiles error: ${err}`);
      }

      const data = await res.json();
      if (Array.isArray(data.files)) {
        files.push(...data.files);
      }
      pageToken = data.nextPageToken;
    } while (pageToken);

    return files;
  }

  public async uploadFile(
    accessToken: string,
    name: string,
    content: Buffer | Uint8Array,
    mimeType: string,
    appProperties?: Record<string, string>
  ): Promise<GDriveFile> {
    const boundary = '-------314159265358979323846';
    const metadata = {
      name,
      parents: ['appDataFolder'],
      appProperties,
    };

    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metaHeader = 'Content-Type: application/json; charset=UTF-8\r\n\r\n';
    const mediaHeader = `Content-Type: ${mimeType}\r\n\r\n`;

    const bodyBuffer = Buffer.concat([
      Buffer.from(delimiter + metaHeader + JSON.stringify(metadata) + delimiter + mediaHeader),
      Buffer.from(content),
      Buffer.from(closeDelimiter),
    ]);

    const res = await fetch(`${GDRIVE_UPLOAD_BASE}/files?uploadType=multipart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
        'Content-Length': String(bodyBuffer.length),
      },
      body: bodyBuffer,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`GDrive uploadFile error: ${err}`);
    }

    return (await res.json()) as GDriveFile;
  }

  public async downloadFile(accessToken: string, fileId: string): Promise<Buffer> {
    const res = await fetch(`${GDRIVE_API_BASE}/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`GDrive downloadFile error: ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  public async deleteFile(accessToken: string, fileId: string): Promise<boolean> {
    const res = await fetch(`${GDRIVE_API_BASE}/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.ok || res.status === 404;
  }
}

let defaultGDriveClient: GDriveClient | null = null;
export function getGDriveClient(): GDriveClient {
  if (!defaultGDriveClient) defaultGDriveClient = new GDriveClient();
  return defaultGDriveClient;
}
