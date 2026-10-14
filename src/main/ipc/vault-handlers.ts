import fs from 'fs';
import path from 'path';
import { ipcMain, BrowserWindow, shell } from 'electron';
import { getIngestionService } from '../services/ingestion/folder-watcher';
import { loadSettings } from '../services/settings/settings-store';
import { resolveVaultPath, getVaultSourcesDir } from '../services/ingestion/paths';
import { ingestImageFile } from '../services/ingestion/coordinator';
import { isSupportedImageExtension } from '../services/imaging/format-detector';
import { getDatabaseDAL } from '../services/database/dal';
import { exportMetadata } from '../services/sync/metadata-sync';

export function registerVaultIpcHandlers(): void {
  const ingestionService = getIngestionService();

  // Forward ingestion progress events to all open windows
  ingestionService.addProgressListener((event) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) {
        win.webContents.send('vault:progress', event);
      }
    }
  });

  ipcMain.handle('vault:scan', async (_event, folderPath?: string, forceReprocess?: boolean) => {
    const targetFolder = folderPath || ingestionService.getWatchedPath() || loadSettings().sourceFolder;
    if (!targetFolder) {
      return { started: false, error: 'No folder path configured' };
    }

    // Launch scan asynchronously so IPC returns immediately
    ingestionService.scanFolder(targetFolder, forceReprocess).catch((err) => {
      console.error('Scan error:', err);
    });

    return { started: true };
  });

  ipcMain.handle('vault:showItemInFolder', async (_event, filePath: string) => {
    try {
      const resolved = resolveVaultPath(filePath);
      shell.showItemInFolder(resolved);
      return true;
    } catch (err: any) {
      console.error('IPC vault:showItemInFolder error:', err);
      return false;
    }
  });

  ipcMain.handle('vault:ingestFiles', async (_event, filePaths: string[]) => {
    try {
      const dal = getDatabaseDAL();
      const settings = loadSettings();

      const vaultRoot = settings.sourceFolder ? path.resolve(settings.sourceFolder) : null;
      const sourcesDir = vaultRoot ? getVaultSourcesDir() : null;
      if (sourcesDir && !fs.existsSync(sourcesDir)) {
        fs.mkdirSync(sourcesDir, { recursive: true });
      }

      let ingested = 0;
      let duplicates = 0;
      let errors = 0;

      for (const filePath of filePaths) {
        if (!isSupportedImageExtension(filePath)) continue;
        try {
          let targetPath = filePath;
          if (vaultRoot && sourcesDir) {
            const resolvedFile = path.resolve(filePath);
            const isInsideVault = resolvedFile.toLowerCase().startsWith(vaultRoot.toLowerCase());
            if (!isInsideVault) {
              const baseName = path.basename(resolvedFile);
              let candidate = path.join(sourcesDir, baseName);
              if (fs.existsSync(candidate) && path.resolve(candidate).toLowerCase() !== resolvedFile.toLowerCase()) {
                const parsed = path.parse(baseName);
                let counter = 1;
                while (fs.existsSync(candidate) && path.resolve(candidate).toLowerCase() !== resolvedFile.toLowerCase()) {
                  candidate = path.join(sourcesDir, `${parsed.name}_${counter}${parsed.ext}`);
                  counter++;
                }
              }
              if (!fs.existsSync(candidate)) {
                fs.copyFileSync(resolvedFile, candidate);
              }
              targetPath = candidate;
            }
          }

          const res = await ingestImageFile(targetPath, dal, false);
          if (res.isNew) {
            ingested++;
          } else {
            duplicates++;
          }
        } catch (fileErr) {
          console.error(`Failed to ingest dropped file ${filePath}:`, fileErr);
          errors++;
        }
      }

      if (vaultRoot && ingested > 0) {
        try {
          exportMetadata(vaultRoot, dal);
        } catch {
          // Best effort metadata export
        }
      }

      return { ingested, duplicates, errors };
    } catch (err: any) {
      console.error('IPC vault:ingestFiles error:', err);
      return { ingested: 0, duplicates: 0, errors: filePaths.length };
    }
  });
}

