import sharp from 'sharp';
import fs from 'fs';
import { ExportPlatform } from '../../../types/export';
import { getPlatformSpec } from './pack-spec';

export interface ConvertedAsset {
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
  filename: string;
}

export async function convertStickerForPlatform(
  filePath: string,
  platform: ExportPlatform,
  baseFilename: string,
  isAnimated = false
): Promise<ConvertedAsset> {
  const spec = getPlatformSpec(platform);
  const fileBuffer = fs.readFileSync(filePath);

  switch (platform) {
    case 'telegram':
      return convertTelegramSticker(fileBuffer, baseFilename, isAnimated);
    case 'discord-emoji':
      return convertDiscordEmoji(fileBuffer, baseFilename, isAnimated);
    case 'discord-sticker':
      return convertDiscordSticker(fileBuffer, baseFilename, isAnimated);
    case 'whatsapp':
      return convertWhatsAppSticker(fileBuffer, baseFilename);
    default:
      throw new Error(`Unsupported export platform: ${platform}`);
  }
}

async function convertTelegramSticker(
  buffer: Buffer,
  baseFilename: string,
  isAnimated: boolean
): Promise<ConvertedAsset> {
  let quality = 90;
  let resultBuffer: Buffer;

  do {
    resultBuffer = await sharp(buffer, { animated: isAnimated })
      .resize({
        width: 512,
        height: 512,
        fit: 'inside',
        withoutEnlargement: false,
      })
      .webp({ quality, effort: 4 })
      .toBuffer();

    if (resultBuffer.length <= 512 * 1024 || quality <= 50) break;
    quality -= 15;
  } while (quality >= 40);

  const meta = await sharp(resultBuffer).metadata();
  return {
    buffer: resultBuffer,
    format: 'webp',
    width: meta.width || 512,
    height: meta.height || 512,
    filename: `${baseFilename}.webp`,
  };
}

async function convertDiscordEmoji(
  buffer: Buffer,
  baseFilename: string,
  isAnimated: boolean
): Promise<ConvertedAsset> {
  if (isAnimated) {
    const res = await sharp(buffer, { animated: true })
      .resize({
        width: 128,
        height: 128,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .gif()
      .toBuffer();

    const meta = await sharp(res).metadata();
    return {
      buffer: res,
      format: 'gif',
      width: meta.width || 128,
      height: meta.height || 128,
      filename: `${baseFilename}.gif`,
    };
  }

  const res = await sharp(buffer)
    .resize({
      width: 128,
      height: 128,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const meta = await sharp(res).metadata();
  return {
    buffer: res,
    format: 'png',
    width: meta.width || 128,
    height: meta.height || 128,
    filename: `${baseFilename}.png`,
  };
}

async function convertDiscordSticker(
  buffer: Buffer,
  baseFilename: string,
  isAnimated: boolean
): Promise<ConvertedAsset> {
  const pipeline = sharp(buffer, { animated: isAnimated }).resize({
    width: 320,
    height: 320,
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  });

  const res = await (isAnimated ? pipeline.webp({ quality: 85 }) : pipeline.png({ compressionLevel: 8 })).toBuffer();
  const meta = await sharp(res).metadata();
  const ext = isAnimated ? 'webp' : 'png';

  return {
    buffer: res,
    format: ext,
    width: meta.width || 320,
    height: meta.height || 320,
    filename: `${baseFilename}.${ext}`,
  };
}

async function convertWhatsAppSticker(
  buffer: Buffer,
  baseFilename: string
): Promise<ConvertedAsset> {
  let quality = 80;
  let resultBuffer: Buffer;

  do {
    resultBuffer = await sharp(buffer)
      .resize({
        width: 512,
        height: 512,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality, effort: 4 })
      .toBuffer();

    if (resultBuffer.length <= 100 * 1024 || quality <= 40) break;
    quality -= 15;
  } while (quality >= 30);

  const meta = await sharp(resultBuffer).metadata();
  return {
    buffer: resultBuffer,
    format: 'webp',
    width: meta.width || 512,
    height: meta.height || 512,
    filename: `${baseFilename}.webp`,
  };
}

export async function generateTrayIcon(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(96, 96, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}
