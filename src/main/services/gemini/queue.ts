import { GeminiStickerResponse, TaggingTask } from './types';
import { requestGeminiTagging } from './client';

export class GeminiQueue {
  private queue: TaggingTask[] = [];
  private activeWorkers = 0;
  private maxConcurrency = 2;
  private delayBetweenCallsMs = 300;
  private isProcessing = false;

  constructor(maxConcurrency = 2, delayBetweenCallsMs = 300) {
    this.maxConcurrency = maxConcurrency;
    this.delayBetweenCallsMs = delayBetweenCallsMs;
  }

  public enqueue(
    itemId: string,
    imageBuffer: Buffer,
    mimeType = 'image/webp'
  ): Promise<GeminiStickerResponse> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        itemId,
        imageBuffer,
        mimeType,
        resolve,
        reject,
        retries: 0,
      });

      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.activeWorkers >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.activeWorkers++;

    try {
      const result = await requestGeminiTagging(task.imageBuffer, task.mimeType);
      task.resolve(result);
    } catch (err: any) {
      const isRateLimited = err?.status === 429 || String(err?.message).includes('429') || String(err?.message).includes('RESOURCE_EXHAUSTED');

      if (isRateLimited && task.retries < 3) {
        task.retries++;
        const backoffMs = Math.pow(2, task.retries) * 1000;
        console.warn(`Gemini rate limited for item ${task.itemId}. Retrying in ${backoffMs}ms (attempt ${task.retries})...`);

        setTimeout(() => {
          this.queue.unshift(task); // Re-queue at the front
          this.processNext();
        }, backoffMs);
      } else {
        task.reject(err);
      }
    } finally {
      this.activeWorkers--;
      setTimeout(() => {
        this.processNext();
      }, this.delayBetweenCallsMs);
    }
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public getActiveCount(): number {
    return this.activeWorkers;
  }
}

let globalQueue: GeminiQueue | null = null;

export function getGeminiQueue(): GeminiQueue {
  if (!globalQueue) {
    globalQueue = new GeminiQueue(2, 250);
  }
  return globalQueue;
}
