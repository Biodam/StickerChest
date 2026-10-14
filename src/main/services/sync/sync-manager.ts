import fs from 'fs';
import path from 'path';
import { SyncProgress, SyncState } from '../../../types/models';
import { loadSettings } from '../settings/settings-store';
import { getIngestionService } from '../ingestion/folder-watcher';
import { getMainWindow } from '../../windows/mainWindow';
import { getPickerWindow } from '../../windows/pickerWindow';
import { parseDriveFolderId } from './folder-link-parser';
import { listFolder, downloadFile } from './drive-public-client';
import { computeDownloads, ledgerStamp, sanitizeFilename, SyncLedger } from './sync-diff';
import { importMetadata } from './metadata-sync';

const LEDGER_NAME = '.drive-sync-state.json';

function readLedger(folder: string): SyncLedger {
  try {
    return JSON.parse(fs.readFileSync(path.join(folder, LEDGER_NAME), 'utf-8'));
  } catch {
    return {};
  }
}

function writeLedger(folder: string, ledger: SyncLedger): void {
  try {
    fs.writeFileSync(path.join(folder, LEDGER_NAME), JSON.stringify(ledger, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write drive sync ledger:', err);
  }
}

export class DriveSyncManager {
  private isSyncing = false;
  private lastSyncTimestamp: number | null = null;
  private progress: SyncProgress = { state: 'idle', filesTransferred: 0, totalFiles: 0, lastSyncTimestamp: null };

  private notify(state: SyncState, step?: string, error?: string): void {
    this.progress = { ...this.progress, state, currentStep: step, errorMessage: error, lastSyncTimestamp: this.lastSyncTimestamp };
    try {
      getMainWindow()?.webContents.send('sync:progress', this.progress);
      getPickerWindow()?.webContents.send('sync:progress', this.progress);
    } catch {}
  }

  /** Validates link + key by listing the folder. */
  public async validate(folderUrl: string, apiKey: string): Promise<{ success: boolean; fileCount?: number; error?: string }> {
    const folderId = parseDriveFolderId(folderUrl);
    if (!folderId) return { success: false, error: 'That does not look like a Google Drive folder link.' };
    if (!apiKey.trim()) return { success: false, error: 'A Google API key is required.' };
    try {
      const files = await listFolder(folderId, apiKey.trim());
      return { success: true, fileCount: files.length };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async syncNow(): Promise<{ success: boolean; downloaded?: number; error?: string }> {
    if (this.isSyncing) return { success: false, error: 'Sync already in progress' };

    const settings = loadSettings();
    const folder = settings.sourceFolder;
    if (!folder) return this.fail('Choose a local sticker folder first.');
    const folderId = parseDriveFolderId(settings.driveFolderUrl || '');
    if (!folderId) return this.fail('Paste a valid public Google Drive folder link in Settings.');
    if (!settings.driveApiKey) return this.fail('Add a Google API key in Settings.');

    this.isSyncing = true;
    this.notify('syncing', 'Reading Drive folder...');
    try {
      const remote = await listFolder(folderId, settings.driveApiKey);
      const ledger = readLedger(folder);
      const todo = computeDownloads(remote, ledger, (name) => fs.existsSync(path.join(folder, name)));

      this.progress = { ...this.progress, filesTransferred: 0, totalFiles: todo.length };
      for (const file of todo) {
        const safe = sanitizeFilename(file.name);
        this.notify('syncing', `Downloading ${safe} (${this.progress.filesTransferred + 1}/${todo.length})`);
        await downloadFile(file.id, settings.driveApiKey, path.join(folder, safe));
        ledger[safe] = ledgerStamp(file);
        this.progress.filesTransferred += 1;
        writeLedger(folder, ledger);
      }

      this.notify('syncing', 'Scanning sticker folder...');
      await getIngestionService().scanFolder(folder, false);
      const applied = importMetadata(folder);

      this.lastSyncTimestamp = Date.now();
      this.notify('synced', `Synced ${todo.length} file(s)${applied ? `, applied metadata to ${applied}` : ''}`);
      return { success: true, downloaded: todo.length };
    } catch (err: any) {
      console.error('Drive folder sync failure:', err);
      return this.fail(err.message);
    } finally {
      this.isSyncing = false;
    }
  }

  private timer: NodeJS.Timeout | null = null;

  /** Syncs once at startup and then on the configured interval (re-reads settings each tick). */
  public startAutoSync(): void {
    if (this.timer) return;
    const tick = (): void => {
      const s = loadSettings();
      if (s.driveAutoSync && s.driveFolderUrl && s.driveApiKey && s.sourceFolder) {
        void this.syncNow();
      }
    };
    setTimeout(tick, 5000);
    this.timer = setInterval(tick, Math.max(5, loadSettings().syncIntervalMinutes || 15) * 60_000);
  }

  private fail(message: string): { success: false; error: string } {
    this.notify('error', 'Sync failed', message);
    return { success: false, error: message };
  }
}

let instance: DriveSyncManager | null = null;
export function getSyncManager(): DriveSyncManager {
  if (!instance) instance = new DriveSyncManager();
  return instance;
}
