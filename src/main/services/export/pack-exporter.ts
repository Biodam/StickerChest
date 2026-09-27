import fs from 'fs';
import path from 'path';
import { ZipArchive } from 'archiver';
import { PackExportOptions, BackupProgressEvent } from '../../../types/export';
import { getDatabaseDAL, StickerDatabaseDAL } from '../database/dal';
import { resolveVaultPath } from '../ingestion/paths';
import { convertStickerForPlatform, generateTrayIcon } from './pack-converter';
import { sanitizePackSlug } from './pack-spec';

export async function exportStickerPack(
  options: PackExportOptions,
  onProgress?: (event: BackupProgressEvent) => void,
  customDal?: StickerDatabaseDAL
): Promise<{ success: boolean; totalExported: number; outputPath: string }> {
  const { platform, itemIds, outputZipPath, packTitle = 'Sticker Pack', packAuthor = 'Sticker Chest' } = options;
  const total = itemIds.length;
  let processed = 0;

  const outputDir = path.dirname(outputZipPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputStream = fs.createWriteStream(outputZipPath);
  const archive = new ZipArchive({ zlib: { level: 8 } });

  const archivePromise = new Promise<void>((resolve, reject) => {
    outputStream.on('close', () => resolve());
    archive.on('error', (err: any) => reject(err));
  });

  archive.pipe(outputStream);

  const convertedList: Array<{ filename: string; originalName: string; tags: string[] }> = [];
  let firstItemBuffer: Buffer | null = null;

  const dal = customDal || getDatabaseDAL();
  for (let i = 0; i < total; i++) {
    const itemId = itemIds[i];
    const item = dal.getItemById(itemId);
    if (!item) continue;

    const sourcePath = resolveVaultPath(item.originalPath);
    if (!fs.existsSync(sourcePath)) continue;

    onProgress?.({
      stage: 'packing',
      currentFile: item.filename,
      processed: i + 1,
      total,
    });

    const baseName = `${String(i + 1).padStart(2, '0')}_${sanitizePackSlug(path.parse(item.filename).name)}`;
    const converted = await convertStickerForPlatform(sourcePath, platform, baseName, item.isAnimated);

    if (!firstItemBuffer) {
      firstItemBuffer = converted.buffer;
    }

    archive.append(converted.buffer, { name: converted.filename });
    convertedList.push({
      filename: converted.filename,
      originalName: item.filename,
      tags: item.tags || [],
    });
    processed++;
  }

  // Generate metadata depending on platform
  if (platform === 'whatsapp') {
    if (firstItemBuffer) {
      const trayIcon = await generateTrayIcon(firstItemBuffer);
      archive.append(trayIcon, { name: 'tray.png' });
    }

    const whatsappContents = {
      android_play_store_link: '',
      ios_app_store_link: '',
      name: packTitle,
      publisher: packAuthor,
      tray_image_file: 'tray.png',
      image_data_version: '1',
      avoid_cache: false,
      stickers: convertedList.map((c) => ({
        image_file: c.filename,
        emojis: c.tags.slice(0, 3),
      })),
    };
    archive.append(JSON.stringify(whatsappContents, null, 2), { name: 'contents.json' });
  } else {
    const packMetadata = {
      platform,
      packTitle,
      packAuthor,
      exportedAt: new Date().toISOString(),
      stickerCount: convertedList.length,
      stickers: convertedList,
    };
    archive.append(JSON.stringify(packMetadata, null, 2), { name: 'pack-info.json' });
  }

  await archive.finalize();
  await archivePromise;

  onProgress?.({
    stage: 'done',
    processed,
    total,
  });

  return {
    success: true,
    totalExported: processed,
    outputPath: outputZipPath,
  };
}
