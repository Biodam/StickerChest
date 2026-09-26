import fs from 'fs';

export function isCloudDrivePath(targetPath: string): boolean {
  const normalized = targetPath.toLowerCase();
  return (
    normalized.includes('google drive') ||
    normalized.includes('googledrive') ||
    normalized.includes('my drive') ||
    normalized.includes('cloudstorage') ||
    normalized.includes('onedrive') ||
    normalized.includes('dropbox')
  );
}

export async function waitUntilFileStable(
  filePath: string,
  maxWaitMs = 5000,
  pollIntervalMs = 500
): Promise<boolean> {
  const startTime = Date.now();
  let lastSize = -1;

  while (Date.now() - startTime < maxWaitMs) {
    try {
      if (!fs.existsSync(filePath)) {
        await sleep(pollIntervalMs);
        continue;
      }

      const stats = await fs.promises.stat(filePath);

      // If file has 0 bytes, Google Drive might still be creating the file placeholder
      if (stats.size === 0) {
        await sleep(pollIntervalMs);
        continue;
      }

      // Check if size is stable across consecutive checks
      if (stats.size === lastSize) {
        // Try opening to ensure no active write lock from Google Drive sync engine
        const fd = await fs.promises.open(filePath, 'r');
        await fd.close();
        return true;
      }

      lastSize = stats.size;
      await sleep(pollIntervalMs);
    } catch (err: any) {
      // EBUSY or EPERM means sync client still writing/locking
      await sleep(pollIntervalMs);
    }
  }

  // Final check: can we read file now?
  try {
    const stats = await fs.promises.stat(filePath);
    return stats.size > 0;
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
