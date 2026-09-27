import fs from 'fs';
import path from 'path';
import { ZipArchive } from 'archiver';
import { VaultManifest, VaultManifestItem, BackupProgressEvent } from '../../../types/export';
import { ImageTier } from '../../../types/models';
import { getDatabaseDAL, StickerDatabaseDAL } from '../database/dal';
import { getDatabase } from '../database/connection';
import { resolveVaultPath } from '../ingestion/paths';

export async function createVaultBackup(
  outputArchiveFilePath: string,
  onProgress?: (event: BackupProgressEvent) => void,
  customDal?: StickerDatabaseDAL
): Promise<{ success: boolean; totalItems: number; outputPath: string }> {
  const dal = customDal || getDatabaseDAL();
  const { items } = dal.searchItems({ limit: 1000000 });
  const total = items.length;

  const outDir = path.dirname(outputArchiveFilePath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outputStream = fs.createWriteStream(outputArchiveFilePath);
  const archive = new ZipArchive({ zlib: { level: 6 } });

  const archivePromise = new Promise<void>((resolve, reject) => {
    outputStream.on('close', () => resolve());
    archive.on('error', (err: any) => reject(err));
  });

  archive.pipe(outputStream);

  // 1. Build Manifest
  onProgress?.({ stage: 'manifest', processed: 0, total });
  const manifestItems: VaultManifestItem[] = [];

  for (const item of items) {
    const manifestVariants: VaultManifestItem['variants'] = {};
    const tiers: ImageTier[] = ['sticker', 'emoji', 'thumb'];

    for (const tier of tiers) {
      const v = item.variants[tier];
      if (v) {
        manifestVariants[tier] = {
          tier,
          pathRel: `variants/${tier}/${path.basename(v.filePath)}`,
          format: v.format,
          width: v.width,
          height: v.height,
          fileSizeBytes: v.fileSizeBytes,
        };
      }
    }

    manifestItems.push({
      id: item.id,
      sha256Hash: item.sha256Hash,
      filename: item.filename,
      originalPathRel: `sources/${item.filename}`,
      ext: item.ext,
      mimeType: item.mimeType,
      width: item.width,
      height: item.height,
      fileSizeBytes: item.fileSizeBytes,
      isAnimated: item.isAnimated,
      frameCount: item.frameCount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      tags: item.tags,
      userTags: item.userTags,
      customAttributes: item.customAttributes,
      metadata: item.metadata,
      variants: manifestVariants,
    });
  }

  const manifest: VaultManifest = {
    version: '1.0.0',
    generator: 'Sticker Chest v0.0.1',
    exportedAt: new Date().toISOString(),
    totalItems: items.length,
    items: manifestItems,
  };

  archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

  // 2. Snapshot Database
  onProgress?.({ stage: 'database', processed: 0, total });
  const db = (dal as any).db || getDatabase();
  const tempDbSnapshot = path.join(outDir, `_temp_db_${Date.now()}.sqlite`);
  await db.backup(tempDbSnapshot);
  archive.file(tempDbSnapshot, { name: 'database.sqlite' });

  // 3. Collect & Append Assets
  let processed = 0;
  for (const item of items) {
    const sourcePath = resolveVaultPath(item.originalPath);
    if (fs.existsSync(sourcePath)) {
      archive.file(sourcePath, { name: `sources/${item.filename}` });
    }

    const tiers: ImageTier[] = ['sticker', 'emoji', 'thumb'];
    for (const tier of tiers) {
      const v = item.variants[tier];
      if (v) {
        const variantPath = resolveVaultPath(v.filePath);
        if (fs.existsSync(variantPath)) {
          archive.file(variantPath, { name: `variants/${tier}/${path.basename(variantPath)}` });
        }
      }
    }

    processed++;
    onProgress?.({
      stage: 'assets',
      currentFile: item.filename,
      processed,
      total,
    });
  }

  onProgress?.({ stage: 'packing', processed, total });
  await archive.finalize();
  await archivePromise;

  // Clean up temporary sqlite backup
  try {
    if (fs.existsSync(tempDbSnapshot)) {
      fs.unlinkSync(tempDbSnapshot);
    }
  } catch {
    // Ignore cleanup error
  }

  onProgress?.({ stage: 'done', processed, total });

  return {
    success: true,
    totalItems: processed,
    outputPath: outputArchiveFilePath,
  };
}
