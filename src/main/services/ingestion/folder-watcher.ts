import chokidar, { FSWatcher } from 'chokidar';
import { scanDirectoryForImages } from './file-scanner';
import { ingestImageFile } from './coordinator';
import { IngestionProgressEvent } from '../../../types/models';
import { isSupportedImageExtension } from '../imaging/format-detector';
import { getDatabaseDAL } from '../database/dal';
import { isCloudDrivePath } from './cloud-sync-helper';

export type ProgressListener = (event: IngestionProgressEvent) => void;

export class IngestionService {
  private watcher: FSWatcher | null = null;
  private watchedPath: string | null = null;
  private isScanning = false;
  private listeners: Set<ProgressListener> = new Set();
  private periodicTimer: NodeJS.Timeout | null = null;
  private periodicIntervalMinutes = 15;

  public addProgressListener(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(event: IngestionProgressEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Progress listener error:', err);
      }
    }
  }

  public async scanFolder(folderPath: string, forceReprocess = false): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;

    try {
      this.notify({ status: 'scanning', processedCount: 0, totalCount: 0 });

      const filePaths = await scanDirectoryForImages(folderPath);
      const total = filePaths.length;

      this.notify({ status: 'hashing', processedCount: 0, totalCount: total });

      const dal = getDatabaseDAL();
      let processed = 0;

      for (const filePath of filePaths) {
        this.notify({
          status: 'resizing',
          currentFile: filePath,
          processedCount: processed,
          totalCount: total,
        });

        try {
          await ingestImageFile(filePath, dal, forceReprocess);
        } catch (fileErr: any) {
          console.warn(`Skipping locked/syncing file ${filePath}:`, fileErr.message);
        }

        processed++;
      }

      this.notify({ status: 'idle', processedCount: processed, totalCount: total });
    } catch (err: any) {
      this.notify({
        status: 'error',
        processedCount: 0,
        totalCount: 0,
        error: err.message || 'Scan failed',
      });
    } finally {
      this.isScanning = false;
    }
  }

  public startWatching(folderPath: string, intervalMinutes = 15): void {
    this.stopWatching();
    this.watchedPath = folderPath;
    this.periodicIntervalMinutes = intervalMinutes;

    const isCloud = isCloudDrivePath(folderPath);

    // Setup Chokidar with cloud-safe options
    this.watcher = chokidar.watch(folderPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
      depth: 5,
      usePolling: isCloud, // Polling is required for Google Drive / OneDrive virtual mounts
      interval: isCloud ? 2000 : 1000,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 250,
      },
    });

    this.watcher.on('add', async (filePath) => {
      if (isSupportedImageExtension(filePath)) {
        try {
          await ingestImageFile(filePath, getDatabaseDAL(), false);
        } catch (err: any) {
          console.warn(`Watcher deferred file ${filePath}:`, err.message);
        }
      }
    });

    this.watcher.on('change', async (filePath) => {
      if (isSupportedImageExtension(filePath)) {
        try {
          await ingestImageFile(filePath, getDatabaseDAL(), true);
        } catch (err: any) {
          console.warn(`Watcher deferred change for ${filePath}:`, err.message);
        }
      }
    });

    // Start periodic background scanner
    this.schedulePeriodicSync();
  }

  public setPeriodicInterval(intervalMinutes: number): void {
    this.periodicIntervalMinutes = intervalMinutes;
    this.schedulePeriodicSync();
  }

  private schedulePeriodicSync(): void {
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
      this.periodicTimer = null;
    }

    if (this.periodicIntervalMinutes > 0 && this.watchedPath) {
      const ms = this.periodicIntervalMinutes * 60 * 1000;
      this.periodicTimer = setInterval(() => {
        if (this.watchedPath) {
          this.scanFolder(this.watchedPath, false).catch((err) => {
            console.error('Periodic scan error:', err);
          });
        }
      }, ms);
    }
  }

  public stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
    if (this.periodicTimer) {
      clearInterval(this.periodicTimer);
      this.periodicTimer = null;
    }
    this.watchedPath = null;
  }

  public getWatchedPath(): string | null {
    return this.watchedPath;
  }
}

let ingestionServiceInstance: IngestionService | null = null;

export function getIngestionService(): IngestionService {
  if (!ingestionServiceInstance) {
    ingestionServiceInstance = new IngestionService();
  }
  return ingestionServiceInstance;
}
