import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

export interface DriveFileInfo {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  md5Checksum?: string;
  modifiedTime?: string;
}

const API_BASE = 'https://www.googleapis.com/drive/v3';
export const FOLDER_MIME = 'application/vnd.google-apps.folder';

async function describeError(res: Response): Promise<string> {
  let reason = '';
  try {
    const body = await res.json();
    reason = body?.error?.message || '';
  } catch {}
  if (res.status === 404) return 'Folder not found. Check the link and make sure it is shared as "Anyone with the link".';
  if (res.status === 403 || res.status === 400) return `Google rejected the request: ${reason || res.statusText}. Check the API key and that the Drive API is enabled.`;
  return `Drive request failed (${res.status}): ${reason || res.statusText}`;
}

/** Lists all direct children of a public folder using only an API key (no OAuth). */
export async function listFolder(folderId: string, apiKey: string): Promise<DriveFileInfo[]> {
  const files: DriveFileInfo[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(`${API_BASE}/files`);
    url.searchParams.set('q', `'${folderId}' in parents and trashed = false`);
    url.searchParams.set('fields', 'nextPageToken, files(id, name, mimeType, size, md5Checksum, modifiedTime)');
    url.searchParams.set('pageSize', '1000');
    url.searchParams.set('supportsAllDrives', 'true');
    url.searchParams.set('includeItemsFromAllDrives', 'true');
    url.searchParams.set('key', apiKey);
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    let res: Response;
    try {
      res = await fetch(url);
    } catch (err: any) {
      throw new Error(`Network error while listing Drive folder: ${err.message}`);
    }
    if (!res.ok) throw new Error(await describeError(res));

    const data = await res.json();
    files.push(...(data.files || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return files;
}

/** Streams a public file to destPath (via a .part temp file, then atomic rename). */
export async function downloadFile(fileId: string, apiKey: string, destPath: string): Promise<void> {
  const url = `${API_BASE}/files/${fileId}?alt=media&supportsAllDrives=true&key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok || !res.body) throw new Error(await describeError(res));

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const tmpPath = `${destPath}.part`;
  try {
    await pipeline(Readable.fromWeb(res.body as any), fs.createWriteStream(tmpPath));
    fs.renameSync(tmpPath, destPath);
  } catch (err) {
    try { fs.rmSync(tmpPath, { force: true }); } catch {}
    throw err;
  }
}
