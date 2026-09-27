import { ExportPlatform } from '../../../types/export';

export interface PlatformSpec {
  name: string;
  description: string;
  maxWidth: number;
  maxHeight: number;
  exactSquare: boolean;
  maxSizeBytes: number;
  primaryFormat: 'webp' | 'png' | 'gif';
  supportedMimeTypes: string[];
}

export const PLATFORM_SPECS: Record<ExportPlatform, PlatformSpec> = {
  telegram: {
    name: 'Telegram Sticker Pack',
    description: '512×512 WebP or PNG, transparent background, <512 KB.',
    maxWidth: 512,
    maxHeight: 512,
    exactSquare: false,
    maxSizeBytes: 512 * 1024,
    primaryFormat: 'webp',
    supportedMimeTypes: ['image/webp', 'image/png'],
  },
  'discord-emoji': {
    name: 'Discord Custom Emojis',
    description: '128×128 square PNG or animated GIF, <256 KB.',
    maxWidth: 128,
    maxHeight: 128,
    exactSquare: true,
    maxSizeBytes: 256 * 1024,
    primaryFormat: 'png',
    supportedMimeTypes: ['image/png', 'image/gif'],
  },
  'discord-sticker': {
    name: 'Discord Custom Stickers',
    description: '320×320 square PNG or APNG, <500 KB.',
    maxWidth: 320,
    maxHeight: 320,
    exactSquare: true,
    maxSizeBytes: 500 * 1024,
    primaryFormat: 'png',
    supportedMimeTypes: ['image/png'],
  },
  whatsapp: {
    name: 'WhatsApp / Signal Sticker Pack',
    description: '512×512 square WebP bundle with metadata, <100 KB per sticker.',
    maxWidth: 512,
    maxHeight: 512,
    exactSquare: true,
    maxSizeBytes: 100 * 1024,
    primaryFormat: 'webp',
    supportedMimeTypes: ['image/webp'],
  },
};

export function getPlatformSpec(platform: ExportPlatform): PlatformSpec {
  return PLATFORM_SPECS[platform];
}

export function validateBufferSize(platform: ExportPlatform, bufferSize: number): boolean {
  const spec = getPlatformSpec(platform);
  return bufferSize <= spec.maxSizeBytes;
}

export function sanitizePackSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'sticker_pack';
}
