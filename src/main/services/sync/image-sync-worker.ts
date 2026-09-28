import fs from 'fs';
import path from 'path';
import { ImageTier } from '../../../types/models';
import { getVaultRoot, ensureVaultDirectories, getVariantOutputPath } from '../ingestion/paths';
import { GDriveClient, GDriveFile } from './gdrive-client';

export interface ImageSyncProgress {
  uploaded: number;
  downloaded: number;
  totalToProcess: number;
  currentFile?: string;
}

export class ImageSyncWorker {
  constructor(private client: GDriveClient) {}

  public async syncImages(
    accessToken: string,
    onProgress?: (progress: ImageSyncProgress) => void
  ): Promise<{ uploaded: number; downloaded: number }> {
    ensureVaultDirectories();
    const vaultRoot = getVaultRoot();

    // 1. Fetch remote variant files from Google Drive appDataFolder
    const remoteFiles = await this.client.listFiles(accessToken);
    const remoteImageMap = new Map<string, GDriveFile>();
    for (const file of remoteFiles) {
      if (file.name.startsWith('img_') || file.appProperties?.type === 'variant') {
        remoteImageMap.set(file.name, file);
      }
    }

    // 2. Discover all local variant files
    const localVariants: { tier: ImageTier; filename: string; fullPath: string }[] = [];
    const tiers: ImageTier[] = ['sticker', 'emoji', 'thumb'];

    for (const tier of tiers) {
      const tierDir = path.join(vaultRoot, '.stickerchest', 'variants', tier);
      if (fs.existsSync(tierDir)) {
        const files = fs.readdirSync(tierDir);
        for (const f of files) {
          if (f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.gif')) {
            localVariants.push({
              tier,
              filename: `img_${tier}_${f}`,
              fullPath: path.join(tierDir, f),
            });
          }
        }
      }
    }

    // 3. Determine uploads (local files missing from remote)
    const toUpload = localVariants.filter((v) => !remoteImageMap.has(v.filename));

    // 4. Determine downloads (remote files missing locally)
    const localNames = new Set(localVariants.map((v) => v.filename));
    const toDownload = Array.from(remoteImageMap.values()).filter((rf) => !localNames.has(rf.name));

    let uploaded = 0;
    let downloaded = 0;
    const totalToProcess = toUpload.length + toDownload.length;

    // 5. Upload missing local files (concurrency 3)
    for (const item of toUpload) {
      try {
        if (onProgress) {
          onProgress({ uploaded, downloaded, totalToProcess, currentFile: item.filename });
        }
        const buffer = fs.readFileSync(item.fullPath);
        const mimeType = item.filename.endsWith('.png') ? 'image/png' : 'image/webp';
        await this.client.uploadFile(accessToken, item.filename, buffer, mimeType, {
          type: 'variant',
          tier: item.tier,
        });
        uploaded++;
      } catch (err) {
        console.error(`Failed to upload ${item.filename} to Google Drive:`, err);
      }
    }

    // 6. Download missing remote files
    for (const file of toDownload) {
      try {
        if (onProgress) {
          onProgress({ uploaded, downloaded, totalToProcess, currentFile: file.name });
        }
        // Format: img_{tier}_{hash}.webp
        const parts = file.name.split('_');
        const tier = (parts[1] || file.appProperties?.tier || 'sticker') as ImageTier;
        const baseName = parts.slice(2).join('_') || `${file.id}.webp`;

        const targetDir = path.join(vaultRoot, '.stickerchest', 'variants', tier);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        const targetPath = path.join(targetDir, baseName);

        const content = await this.client.downloadFile(accessToken, file.id);
        fs.writeFileSync(targetPath, content);
        downloaded++;
      } catch (err) {
        console.error(`Failed to download ${file.name} from Google Drive:`, err);
      }
    }

    if (onProgress) {
      onProgress({ uploaded, downloaded, totalToProcess });
    }

    return { uploaded, downloaded };
  }
}
