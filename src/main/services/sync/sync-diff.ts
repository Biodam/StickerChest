import path from 'path';
import { DriveFileInfo, FOLDER_MIME } from './drive-public-client';

export const METADATA_FILENAME = 'sticker-chest-metadata.json';
const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];

/** Maps remote filename -> md5 of last successful download. */
export type SyncLedger = Record<string, string>;

/** Strips path separators and reserved characters so remote names stay inside the target folder. */
export function sanitizeFilename(name: string): string {
  return path.basename(name).replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_').trim();
}

export function isDownloadable(file: DriveFileInfo): boolean {
  if (file.mimeType === FOLDER_MIME) return false;
  if (file.name === METADATA_FILENAME) return true;
  return SUPPORTED_EXTENSIONS.includes(path.extname(file.name).toLowerCase());
}

/**
 * Pure: decides which remote files need downloading.
 * A file is skipped when the ledger already has the same checksum AND it still exists locally.
 */
export function computeDownloads(
  remote: DriveFileInfo[],
  ledger: SyncLedger,
  existsLocally: (safeName: string) => boolean
): DriveFileInfo[] {
  return remote.filter((file) => {
    if (!isDownloadable(file)) return false;
    const safe = sanitizeFilename(file.name);
    if (!safe) return false;
    const stamp = file.md5Checksum || file.modifiedTime || '';
    return !(ledger[safe] === stamp && existsLocally(safe));
  });
}

export function ledgerStamp(file: DriveFileInfo): string {
  return file.md5Checksum || file.modifiedTime || '';
}
