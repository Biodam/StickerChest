import sharp from 'sharp';
import path from 'path';

export interface ImageFileInfo {
  width: number;
  height: number;
  format: string;
  mimeType: string;
  isAnimated: boolean;
  frameCount: number;
}

const MIME_MAP: Record<string, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
  tiff: 'image/tiff',
};

export async function detectImageInfo(filePath: string): Promise<ImageFileInfo> {
  const metadata = await sharp(filePath, { animated: true }).metadata();

  const format = (metadata.format || path.extname(filePath).replace('.', '')).toLowerCase();
  const mimeType = MIME_MAP[format] || `image/${format}`;
  const frameCount = metadata.pages || 1;
  const isAnimated = frameCount > 1;

  // Sharp gives pageHeight for animated files, height is total height of all frames combined
  const width = metadata.width || 0;
  const height = isAnimated && metadata.pageHeight ? metadata.pageHeight : metadata.height || 0;

  return {
    width,
    height,
    format,
    mimeType,
    isAnimated,
    frameCount,
  };
}

export function isSupportedImageExtension(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext);
}
