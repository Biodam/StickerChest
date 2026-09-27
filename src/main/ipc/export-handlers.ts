import { ipcMain, dialog } from 'electron';
import { getMainWindow } from '../windows/mainWindow';
import { createVaultBackup } from '../services/export/vault-backup';
import { restoreVaultBackup } from '../services/export/vault-restore';
import { exportStickerPack } from '../services/export/pack-exporter';
import { PackExportOptions, RestoreOptions, ConflictResolution, ExportPlatform } from '../../types/export';

export function registerExportIpcHandlers(): void {
  ipcMain.handle('export:createBackup', async (_event, customFilePath?: string) => {
    let targetPath = customFilePath;
    const mainWindow = getMainWindow();

    if (!targetPath) {
      const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const res = await dialog.showSaveDialog(mainWindow || (undefined as any), {
        title: 'Export Full Vault Backup',
        defaultPath: `stickervault-backup-${now}.stickervault`,
        filters: [{ name: 'Sticker Chest Vault Archive', extensions: ['stickervault', 'zip'] }],
      });
      if (res.canceled || !res.filePath) return { canceled: true };
      targetPath = res.filePath;
    }

    try {
      const result = await createVaultBackup(targetPath, (progress) => {
        mainWindow?.webContents.send('export:progress', progress);
      });
      return { canceled: false, ...result };
    } catch (err: any) {
      return { canceled: false, success: false, error: err.message };
    }
  });

  ipcMain.handle(
    'export:restoreBackup',
    async (_event, options?: { backupFilePath?: string; conflictResolution?: ConflictResolution }) => {
      let targetPath = options?.backupFilePath;
      const conflictResolution = options?.conflictResolution || 'skip';
      const mainWindow = getMainWindow();

      if (!targetPath) {
        const res = await dialog.showOpenDialog(mainWindow || (undefined as any), {
          title: 'Select Sticker Vault Backup Archive',
          properties: ['openFile'],
          filters: [{ name: 'Sticker Chest Vault Archive', extensions: ['stickervault', 'zip'] }],
        });
        if (res.canceled || res.filePaths.length === 0) return { canceled: true };
        targetPath = res.filePaths[0];
      }

      try {
        const result = await restoreVaultBackup(
          { backupFilePath: targetPath, conflictResolution },
          (progress) => {
            mainWindow?.webContents.send('export:progress', progress);
          }
        );
        return { canceled: false, success: true, ...result };
      } catch (err: any) {
        return { canceled: false, success: false, error: err.message };
      }
    }
  );

  ipcMain.handle('export:exportStickerPack', async (_event, options: {
    platform: ExportPlatform;
    itemIds: string[];
    outputZipPath?: string;
    packTitle?: string;
    packAuthor?: string;
  }) => {
    let targetPath = options.outputZipPath;
    const mainWindow = getMainWindow();

    if (!targetPath) {
      const now = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 10);
      const defaultName = `${options.platform}-pack-${now}.zip`;
      const res = await dialog.showSaveDialog(mainWindow || (undefined as any), {
        title: `Export ${options.platform.toUpperCase()} Sticker Pack`,
        defaultPath: defaultName,
        filters: [{ name: 'Zip Archive', extensions: ['zip'] }],
      });
      if (res.canceled || !res.filePath) return { canceled: true };
      targetPath = res.filePath;
    }

    try {
      const result = await exportStickerPack(
        {
          platform: options.platform,
          itemIds: options.itemIds,
          outputZipPath: targetPath,
          packTitle: options.packTitle,
          packAuthor: options.packAuthor,
        },
        (progress) => {
          mainWindow?.webContents.send('export:progress', progress);
        }
      );
      return { canceled: false, ...result };
    } catch (err: any) {
      return { canceled: false, success: false, error: err.message };
    }
  });

  ipcMain.handle('dialog:showSaveDialog', async (_event, defaultName: string, filters: Array<{ name: string; extensions: string[] }>) => {
    const mainWindow = getMainWindow();
    const res = await dialog.showSaveDialog(mainWindow || (undefined as any), {
      defaultPath: defaultName,
      filters,
    });
    return res.canceled ? null : res.filePath;
  });

  ipcMain.handle('dialog:showOpenDialog', async (_event, filters: Array<{ name: string; extensions: string[] }>) => {
    const mainWindow = getMainWindow();
    const res = await dialog.showOpenDialog(mainWindow || (undefined as any), {
      properties: ['openFile'],
      filters,
    });
    return res.canceled || res.filePaths.length === 0 ? null : res.filePaths[0];
  });
}
