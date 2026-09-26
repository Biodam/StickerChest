import fs from 'fs';
import path from 'path';
import { isSupportedImageExtension } from '../imaging/format-detector';

export async function scanDirectoryForImages(dirPath: string): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    let entries: fs.Dirent[];
    try {
      entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    } catch (err) {
      console.warn(`Could not read directory ${currentDir}:`, err);
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        // Skip hidden folders
        if (!entry.name.startsWith('.')) {
          await walk(fullPath);
        }
      } else if (entry.isFile() && isSupportedImageExtension(entry.name)) {
        results.push(fullPath);
      }
    }
  }

  if (fs.existsSync(dirPath)) {
    await walk(dirPath);
  }

  return results;
}
