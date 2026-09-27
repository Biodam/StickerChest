import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { convertStickerForPlatform, generateTrayIcon } from '../../src/main/services/export/pack-converter';

describe('Pack Conversion Engine (Sharp Pipelines)', () => {
  const tempDir = path.join(os.tmpdir(), `sticker-test-converter-${Date.now()}`);
  const sampleImagePath = path.join(tempDir, 'sample-raw.png');

  beforeAll(async () => {
    fs.mkdirSync(tempDir, { recursive: true });
    // Create an 800x600 test image with colored transparent background
    await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 4,
        background: { r: 59, g: 130, b: 246, alpha: 0.8 },
      },
    })
      .png()
      .toFile(sampleImagePath);
  });

  afterAll(() => {
    try {
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    } catch {
      // Ignore cleanup error
    }
  });

  it('should convert an image for Telegram Sticker (max 512x512 WebP, <512KB)', async () => {
    const converted = await convertStickerForPlatform(sampleImagePath, 'telegram', 'sample_tg', false);
    expect(converted.format).toBe('webp');
    expect(converted.filename).toBe('sample_tg.webp');
    expect(converted.width).toBeLessThanOrEqual(512);
    expect(converted.height).toBeLessThanOrEqual(512);
    expect(converted.buffer.length).toBeLessThanOrEqual(512 * 1024);
  });

  it('should convert an image for Discord Custom Emoji (128x128 square PNG, <256KB)', async () => {
    const converted = await convertStickerForPlatform(sampleImagePath, 'discord-emoji', 'sample_emoji', false);
    expect(converted.format).toBe('png');
    expect(converted.filename).toBe('sample_emoji.png');
    expect(converted.width).toBe(128);
    expect(converted.height).toBe(128);
    expect(converted.buffer.length).toBeLessThanOrEqual(256 * 1024);
  });

  it('should convert an image for Discord Sticker (320x320 square PNG, <500KB)', async () => {
    const converted = await convertStickerForPlatform(sampleImagePath, 'discord-sticker', 'sample_sticker', false);
    expect(converted.format).toBe('png');
    expect(converted.filename).toBe('sample_sticker.png');
    expect(converted.width).toBe(320);
    expect(converted.height).toBe(320);
    expect(converted.buffer.length).toBeLessThanOrEqual(500 * 1024);
  });

  it('should convert an image for WhatsApp Sticker (512x512 square WebP, strictly <100KB)', async () => {
    const converted = await convertStickerForPlatform(sampleImagePath, 'whatsapp', 'sample_wa', false);
    expect(converted.format).toBe('webp');
    expect(converted.filename).toBe('sample_wa.webp');
    expect(converted.width).toBe(512);
    expect(converted.height).toBe(512);
    expect(converted.buffer.length).toBeLessThanOrEqual(100 * 1024);
  });

  it('should generate a compliant WhatsApp 96x96 tray icon', async () => {
    const rawBuffer = fs.readFileSync(sampleImagePath);
    const trayBuffer = await generateTrayIcon(rawBuffer);
    const meta = await sharp(trayBuffer).metadata();
    expect(meta.width).toBe(96);
    expect(meta.height).toBe(96);
    expect(meta.format).toBe('png');
  });
});
