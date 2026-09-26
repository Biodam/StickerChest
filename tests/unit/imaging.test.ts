import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import Database from 'better-sqlite3';
import { initializeSchema } from '../../src/main/services/database/schema';
import { StickerDatabaseDAL } from '../../src/main/services/database/dal';
import { calculateFileSha256, calculateBufferSha256 } from '../../src/main/services/imaging/hasher';
import { detectImageInfo } from '../../src/main/services/imaging/format-detector';
import {
  generateStickerVariant,
  generateEmojiVariant,
  generateThumbnailVariant,
} from '../../src/main/services/imaging/resizer';
import { setCustomVaultRoot } from '../../src/main/services/ingestion/paths';
import { ingestImageFile } from '../../src/main/services/ingestion/coordinator';

describe('Imaging & Ingestion Pipeline', () => {
  const testDir = path.resolve(process.cwd(), '.test-assets');
  const testVault = path.join(testDir, 'vault');
  const testImage = path.join(testDir, 'sample_box.png');

  beforeAll(async () => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    setCustomVaultRoot(testVault);

    // Create a 800x600 test PNG image
    await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 4,
        background: { r: 50, g: 150, b: 250, alpha: 1 },
      },
    })
      .png()
      .toFile(testImage);
  });

  afterAll(() => {
    try {
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    } catch {
      // Cleanup best effort
    }
  });

  it('should compute SHA-256 correctly from file and buffer', async () => {
    const fileHash = await calculateFileSha256(testImage);
    const buffer = fs.readFileSync(testImage);
    const bufHash = calculateBufferSha256(buffer);

    expect(fileHash).toBeDefined();
    expect(fileHash.length).toBe(64);
    expect(fileHash).toBe(bufHash);
  });

  it('should detect image metadata, dimensions, and animation status', async () => {
    const info = await detectImageInfo(testImage);
    expect(info.width).toBe(800);
    expect(info.height).toBe(600);
    expect(info.format).toBe('png');
    expect(info.mimeType).toBe('image/png');
    expect(info.isAnimated).toBe(false);
    expect(info.frameCount).toBe(1);
  });

  it('should generate sticker, emoji, and thumbnail variants within bounds', async () => {
    const stickerOut = path.join(testVault, 'sticker_test.webp');
    const emojiOut = path.join(testVault, 'emoji_test.webp');
    const thumbOut = path.join(testVault, 'thumb_test.webp');

    const sticker = await generateStickerVariant(testImage, stickerOut, false);
    const emoji = await generateEmojiVariant(testImage, emojiOut, false);
    const thumb = await generateThumbnailVariant(testImage, thumbOut, false);

    // Sticker: max 512, preserving 800:600 aspect ratio (4:3) -> 512 x 384
    expect(sticker.width).toBeLessThanOrEqual(512);
    expect(sticker.height).toBeLessThanOrEqual(512);
    expect(sticker.width).toBe(512);
    expect(sticker.height).toBe(384);
    expect(fs.existsSync(stickerOut)).toBe(true);

    // Emoji: max 128 -> 128 x 96
    expect(emoji.width).toBeLessThanOrEqual(128);
    expect(emoji.height).toBeLessThanOrEqual(128);
    expect(emoji.width).toBe(128);
    expect(emoji.height).toBe(96);
    expect(fs.existsSync(emojiOut)).toBe(true);

    // Thumbnail: max 96 -> 96 x 72
    expect(thumb.width).toBeLessThanOrEqual(96);
    expect(thumb.height).toBeLessThanOrEqual(96);
    expect(fs.existsSync(thumbOut)).toBe(true);
  });

  it('should ingest a file and register all variants in the database DAL', async () => {
    const db = new Database(':memory:');
    initializeSchema(db);
    const dal = new StickerDatabaseDAL(db);

    const result = await ingestImageFile(testImage, dal);
    expect(result.itemId).toBeDefined();
    expect(result.isNew).toBe(true);

    const item = dal.getItemById(result.itemId);
    expect(item).not.toBeNull();
    expect(item?.variants.sticker).not.toBeNull();
    expect(item?.variants.emoji).not.toBeNull();
    expect(item?.variants.thumb).not.toBeNull();
    expect(item?.width).toBe(800);
    expect(item?.height).toBe(600);

    // Second ingestion should deduplicate via SHA-256
    const secondResult = await ingestImageFile(testImage, dal);
    expect(secondResult.isNew).toBe(false);
    expect(secondResult.itemId).toBe(result.itemId);

    db.close();
  });
});
