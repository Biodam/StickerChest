import chokidar, { FSWatcher } from 'chokidar';
import { scanDirectoryForImages } from './file-scanner';
import { ingestImageFile } from './coordinator';
import { IngestionProgressEvent } from '../../../types/models';
import { isSupportedImageExtension } from '../imaging/format-detector';
import { getDatabaseDAL } from '../database/dal';

export type ProgressListener = (event: IngestionProgressEvent) => void;

export class IngestionService {
  private watcher: FSWatcher | null = null;
  private watchedPath: string | null = null;
  private isScanning = false;
  private listeners: Set<ProgressListener> = new Set();

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
      this.notify({
        status: 'scanning',
        processedCount: 0,
        totalCount: 0,
      });

      const filePaths = await scanDirectoryForImages(folderPath);
      const total = filePaths.length;

      this.notify({
        status: 'hashing',
        processedCount: 0,
        totalCount: total,
      });

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
          console.error(`Failed to ingest ${filePath}:`, fileErr);
        }

        processed++;
      }

      this.notify({
        status: 'idle',
        processedCount: processed,
        totalCount: total,
      });
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

  public startWatching(folderPath: string): void {
    this.stopWatching();
    this.watchedPath = folderPath;

    this.watcher = chokidar.watch(folderPath, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      ignoreInitial: true, // initial scan handled separately by scanFolder
      depth: 5,
    });

    this.watcher.on('add', async (filePath) => {
      if (isSupportedImageExtension(filePath)) {
        try {
          await ingestImageFile(filePath, getDatabaseDAL(), false);
        } catch (err) {
          console.error(`Watcher failed to ingest new file ${filePath}:`, err);
        }
      }
    });

    this.watcher.on('change', async (filePath) => {
      if (isSupportedImageExtension(filePath)) {
        try {
          await ingestImageFile(filePath, getDatabaseDAL(), true);
        } catch (err) {
          console.error(`Watcher failed to update changed file ${filePath}:`, err);
        }
      }
    });
  }

  public stopWatching(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      this.watchedPath = null;
    }
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
