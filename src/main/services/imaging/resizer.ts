import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export interface ResizeResult {
  filePath: string;
  width: number;
  height: number;
  fileSizeBytes: number;
  format: string;
}

export interface ResizeOptions {
  maxDimension: number;
  isAnimated: boolean;
  firstFrameOnly?: boolean;
  quality?: number;
  targetFormat?: 'webp' | 'png' | 'gif';
}

export async function resizeImageVariant(
  inputPath: string,
  outputPath: string,
  options: ResizeOptions
): Promise<ResizeResult> {
  const { maxDimension, isAnimated, firstFrameOnly = false, quality = 85 } = options;

  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // If firstFrameOnly is requested on animated, we load without { animated: true } to take frame 0
  const pipeline = sharp(inputPath, {
    animated: isAnimated && !firstFrameOnly,
  });

  // Maintain aspect ratio, downscale only
  pipeline.resize({
    width: maxDimension,
    height: maxDimension,
    fit: 'inside',
    withoutEnlargement: true,
  });

  let targetFormat = options.targetFormat;
  if (!targetFormat) {
    if (firstFrameOnly) {
      targetFormat = 'webp';
    } else if (isAnimated) {
      targetFormat = 'webp'; // Animated WebP has great compression and high quality
    } else {
      targetFormat = 'webp';
    }
  }

  if (targetFormat === 'webp') {
    pipeline.webp({
      quality,
      effort: 4,
      lossless: false,
    });
  } else if (targetFormat === 'gif') {
    pipeline.gif({
      effort: 4,
    });
  } else if (targetFormat === 'png') {
    pipeline.png({
      compressionLevel: 8,
    });
  }

  const outputInfo = await pipeline.toFile(outputPath);

  return {
    filePath: outputPath,
    width: outputInfo.width,
    // When animated, outputInfo.height is total strip height in sharp, so calculate page height
    height: isAnimated && !firstFrameOnly && (outputInfo as any).pages
      ? Math.round(outputInfo.height / (outputInfo as any).pages)
      : outputInfo.height,
    fileSizeBytes: outputInfo.size,
    format: targetFormat,
  };
}

export async function generateStickerVariant(
  inputPath: string,
  outputPath: string,
  isAnimated: boolean
): Promise<ResizeResult> {
  return resizeImageVariant(inputPath, outputPath, {
    maxDimension: 512,
    isAnimated,
    quality: 88,
  });
}

export async function generateEmojiVariant(
  inputPath: string,
  outputPath: string,
  isAnimated: boolean
): Promise<ResizeResult> {
  return resizeImageVariant(inputPath, outputPath, {
    maxDimension: 128,
    isAnimated,
    quality: 85,
  });
}

export async function generateThumbnailVariant(
  inputPath: string,
  outputPath: string,
  isAnimated: boolean
): Promise<ResizeResult> {
  return resizeImageVariant(inputPath, outputPath, {
    maxDimension: 96,
    isAnimated,
    firstFrameOnly: true, // Grid virtualization stays fast with static thumbnail
    quality: 80,
  });
}
