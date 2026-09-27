import fs from 'fs';
import path from 'path';
import AdmZip from 'adm-zip';
import { VaultManifest, RestoreOptions, RestoreSummary, BackupProgressEvent } from '../../../types/export';
import { ImageTier } from '../../../types/models';
import { getDatabaseDAL, StickerDatabaseDAL } from '../database/dal';
import { getVaultRoot, ensureVaultDirectories } from '../ingestion/paths';

export async function restoreVaultBackup(
  options: RestoreOptions,
  onProgress?: (event: BackupProgressEvent) => void,
  customDal?: StickerDatabaseDAL
): Promise<RestoreSummary> {
  const { backupFilePath, conflictResolution } = options;
  if (!fs.existsSync(backupFilePath)) {
    throw new Error(`Backup archive file not found: ${backupFilePath}`);
  }

  const zip = new AdmZip(backupFilePath);
  const manifestEntry = zip.getEntry('manifest.json');
  if (!manifestEntry) {
    throw new Error('Invalid backup archive: missing manifest.json');
  }

  const manifest: VaultManifest = JSON.parse(manifestEntry.getData().toString('utf-8'));
  const total = manifest.items?.length || 0;
  ensureVaultDirectories();
  const vaultRoot = getVaultRoot();
  const dal = customDal || getDatabaseDAL();

  let restored = 0;
  let skipped = 0;
  let overwritten = 0;
  let errors = 0;

  for (let i = 0; i < total; i++) {
    const item = manifest.items[i];
    onProgress?.({
      stage: 'restoring',
      currentFile: item.filename,
      processed: i + 1,
      total,
    });

    try {
      const existing = dal.getItemByHash(item.sha256Hash) || dal.getItemById(item.id);

      if (existing && conflictResolution === 'skip') {
        skipped++;
        continue;
      }

      // Unpack source file
      const sourceRel = item.originalPathRel || `sources/${item.filename}`;
      const sourceEntry = zip.getEntry(sourceRel);
      const targetSourcePath = path.join(vaultRoot, 'sources', item.filename);
      if (sourceEntry) {
        fs.writeFileSync(targetSourcePath, sourceEntry.getData());
      }

      // Unpack variant files
      const tiers: ImageTier[] = ['sticker', 'emoji', 'thumb'];
      for (const tier of tiers) {
        const v = item.variants[tier];
        if (v?.pathRel) {
          const vEntry = zip.getEntry(v.pathRel);
          if (vEntry) {
            const destPath = path.join(vaultRoot, '.stickerchest', 'variants', tier, path.basename(v.pathRel));
            fs.writeFileSync(destPath, vEntry.getData());
          }
        }
      }

      if (existing && conflictResolution === 'merge') {
        if (item.tags?.length) {
          dal.bulkAddTags([existing.id], item.tags);
        }
        if (item.customAttributes && Object.keys(item.customAttributes).length > 0) {
          dal.setCustomAttributes(existing.id, { ...existing.customAttributes, ...item.customAttributes });
        }
        if (!existing.metadata && item.metadata) {
          dal.saveMetadata({
            itemId: existing.id,
            character: item.metadata.character || undefined,
            sourceOrigin: item.metadata.sourceOrigin || undefined,
            action: item.metadata.action || undefined,
            feeling: item.metadata.feeling || undefined,
            description: item.metadata.description || undefined,
          });
        }
        overwritten++;
      } else {
        if (existing) {
          dal.deleteItem(existing.id);
          overwritten++;
        } else {
          restored++;
        }

        const itemId = dal.upsertItem({
          id: item.id,
          sha256Hash: item.sha256Hash,
          filename: item.filename,
          originalPath: targetSourcePath,
          ext: item.ext,
          mimeType: item.mimeType,
          width: item.width,
          height: item.height,
          fileSizeBytes: item.fileSizeBytes,
          isAnimated: item.isAnimated,
          frameCount: item.frameCount,
        });

        // Insert variants
        for (const tier of tiers) {
          const v = item.variants[tier];
          if (v) {
            const destPath = path.join(vaultRoot, '.stickerchest', 'variants', tier, path.basename(v.pathRel));
            dal.upsertVariant({
              itemId,
              tier,
              filePath: destPath,
              format: v.format,
              width: v.width,
              height: v.height,
              fileSizeBytes: v.fileSizeBytes,
            });
          }
        }

        // Insert metadata
        if (item.metadata) {
          dal.saveMetadata({
            itemId,
            character: item.metadata.character || undefined,
            sourceOrigin: item.metadata.sourceOrigin || undefined,
            action: item.metadata.action || undefined,
            feeling: item.metadata.feeling || undefined,
            description: item.metadata.description || undefined,
            aiModel: item.metadata.aiModel || undefined,
            aiStatus: item.metadata.aiStatus,
          });
        }

        // Insert tags
        if (item.tags?.length) {
          dal.setTags(itemId, item.tags, false);
        }

        // Insert custom attributes
        if (item.customAttributes && Object.keys(item.customAttributes).length > 0) {
          dal.setCustomAttributes(itemId, item.customAttributes);
        }
      }
    } catch (err) {
      console.error(`Failed to restore item ${item.filename}:`, err);
      errors++;
    }
  }

  onProgress?.({
    stage: 'done',
    processed: total,
    total,
  });

  return {
    restored,
    skipped,
    overwritten,
    errors,
  };
}
