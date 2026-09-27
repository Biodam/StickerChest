export interface GeminiStickerResponse {
  character: string | null;
  source: string | null;
  action: string;
  feeling: string;
  tags: string[];
  description: string;
}

export interface TaggingTask {
  itemId: string;
  imageBuffer: Buffer;
  mimeType: string;
  filename?: string;
  resolve: (value: GeminiStickerResponse) => void;
  reject: (reason: any) => void;
  retries: number;
}
