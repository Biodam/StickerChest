import { SyncProgress, GoogleDriveAccountInfo, SyncState } from '../../../types/models';
import { getTokenVault } from './token-vault';
import { getGDriveClient } from './gdrive-client';
import { ImageSyncWorker } from './image-sync-worker';
import { DbSyncCoordinator } from './db-sync-coordinator';
import { startOAuthFlow } from './oauth-loopback';
import { getMainWindow } from '../../windows/mainWindow';
import { getPickerWindow } from '../../windows/pickerWindow';

export class SyncManager {
  private isSyncing = false;
  private lastSyncTimestamp: number | null = null;
  private currentProgress: SyncProgress = {
    state: 'idle',
    filesTransferred: 0,
    totalFiles: 0,
    bytesTransferred: 0,
    totalBytes: 0,
    lastSyncTimestamp: null,
  };

  private notifyProgress(state: SyncState, currentStep?: string, error?: string): void {
    this.currentProgress = {
      ...this.currentProgress,
      state,
      currentStep,
      errorMessage: error,
      lastSyncTimestamp: this.lastSyncTimestamp,
    };
    try {
      getMainWindow()?.webContents.send('sync:progress', this.currentProgress);
      getPickerWindow()?.webContents.send('sync:progress', this.currentProgress);
    } catch {}
  }

  public async getAccountInfo(): Promise<GoogleDriveAccountInfo> {
    const vault = getTokenVault();
    const tokens = vault.loadTokens();
    if (!tokens) {
      return { connected: false, lastSyncTimestamp: this.lastSyncTimestamp };
    }

    const accessToken = await vault.getValidAccessToken();
    if (!accessToken) {
      return { connected: false, email: tokens.email, lastSyncTimestamp: this.lastSyncTimestamp };
    }

    try {
      const quota = await getGDriveClient().getStorageQuota(accessToken);
      return {
        connected: true,
        email: tokens.email,
        displayName: tokens.displayName,
        storageUsedBytes: quota.usedBytes,
        storageTotalBytes: quota.totalBytes,
        lastSyncTimestamp: this.lastSyncTimestamp,
      };
    } catch {
      return {
        connected: true,
        email: tokens.email,
        displayName: tokens.displayName,
        lastSyncTimestamp: this.lastSyncTimestamp,
      };
    }
  }

  public async connect(clientId?: string, clientSecret?: string): Promise<{ success: boolean; error?: string }> {
    this.notifyProgress('authenticating', 'Waiting for Google OAuth login in browser...');
    try {
      const result = await startOAuthFlow(clientId, clientSecret);
      if (result.success) {
        this.notifyProgress('synced', `Connected as ${result.email}`);
        await this.syncNow();
        return { success: true };
      }
      this.notifyProgress('error', 'Authentication failed', result.error);
      return { success: false, error: result.error };
    } catch (err: any) {
      this.notifyProgress('error', 'Authentication error', err.message);
      return { success: false, error: err.message };
    }
  }

  public async disconnect(): Promise<boolean> {
    getTokenVault().clearTokens();
    this.notifyProgress('idle', 'Disconnected from Google Drive');
    return true;
  }

  public async syncNow(): Promise<{ success: boolean; error?: string }> {
    if (this.isSyncing) {
      return { success: false, error: 'Sync already in progress' };
    }

    const vault = getTokenVault();
    const accessToken = await vault.getValidAccessToken();
    if (!accessToken) {
      this.notifyProgress('error', 'Not connected to Google Drive');
      return { success: false, error: 'Not authenticated with Google Drive' };
    }

    this.isSyncing = true;
    this.notifyProgress('syncing', 'Syncing sticker assets...');

    try {
      const client = getGDriveClient();
      const imageWorker = new ImageSyncWorker(client);
      const dbCoordinator = new DbSyncCoordinator(client);

      // 1. Sync Images
      await imageWorker.syncImages(accessToken, (imgProgress) => {
        this.currentProgress.filesTransferred = imgProgress.uploaded + imgProgress.downloaded;
        this.currentProgress.totalFiles = imgProgress.totalToProcess;
        this.notifyProgress('syncing', `Syncing assets: ${imgProgress.currentFile || ''}`);
      });

      // 2. Check Remote DB vs Local
      this.notifyProgress('syncing', 'Synchronizing vault database...');
      const remoteManifest = await dbCoordinator.getRemoteManifest(accessToken);

      if (remoteManifest && (!this.lastSyncTimestamp || remoteManifest.timestamp > this.lastSyncTimestamp)) {
        this.notifyProgress('downloading', 'Applying newer remote database snapshot...');
        await dbCoordinator.downloadAndApplySnapshot(accessToken, remoteManifest);
      } else {
        await dbCoordinator.uploadSnapshot(accessToken);
      }

      this.lastSyncTimestamp = Date.now();
      this.notifyProgress('synced', 'Library fully synchronized');
      return { success: true };
    } catch (err: any) {
      console.error('Cloud sync failure:', err);
      this.notifyProgress('error', 'Sync failed', err.message);
      return { success: false, error: err.message };
    } finally {
      this.isSyncing = false;
    }
  }
}

let defaultSyncManager: SyncManager | null = null;
export function getSyncManager(): SyncManager {
  if (!defaultSyncManager) defaultSyncManager = new SyncManager();
  return defaultSyncManager;
}
