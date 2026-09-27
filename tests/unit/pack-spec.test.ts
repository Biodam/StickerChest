import { describe, it, expect } from 'vitest';
import { getPlatformSpec, validateBufferSize, sanitizePackSlug, PLATFORM_SPECS } from '../../src/main/services/export/pack-spec';

describe('Pack Export Specifications & Platform Compliance', () => {
  it('should provide strict Telegram Sticker specifications', () => {
    const spec = getPlatformSpec('telegram');
    expect(spec.name).toContain('Telegram');
    expect(spec.maxWidth).toBe(512);
    expect(spec.maxHeight).toBe(512);
    expect(spec.maxSizeBytes).toBe(512 * 1024);
    expect(spec.primaryFormat).toBe('webp');
    expect(spec.supportedMimeTypes).toContain('image/webp');
  });

  it('should provide Discord Custom Emoji specifications', () => {
    const spec = getPlatformSpec('discord-emoji');
    expect(spec.name).toContain('Discord');
    expect(spec.maxWidth).toBe(128);
    expect(spec.maxHeight).toBe(128);
    expect(spec.exactSquare).toBe(true);
    expect(spec.maxSizeBytes).toBe(256 * 1024);
  });

  it('should provide Discord Custom Sticker specifications', () => {
    const spec = getPlatformSpec('discord-sticker');
    expect(spec.maxWidth).toBe(320);
    expect(spec.maxHeight).toBe(320);
    expect(spec.exactSquare).toBe(true);
    expect(spec.maxSizeBytes).toBe(500 * 1024);
  });

  it('should provide WhatsApp Sticker Pack specifications with 100KB limit', () => {
    const spec = getPlatformSpec('whatsapp');
    expect(spec.maxWidth).toBe(512);
    expect(spec.maxHeight).toBe(512);
    expect(spec.exactSquare).toBe(true);
    expect(spec.maxSizeBytes).toBe(100 * 1024);
  });

  it('should validate buffer size thresholds correctly', () => {
    expect(validateBufferSize('whatsapp', 95 * 1024)).toBe(true);
    expect(validateBufferSize('whatsapp', 105 * 1024)).toBe(false);

    expect(validateBufferSize('telegram', 500 * 1024)).toBe(true);
    expect(validateBufferSize('telegram', 520 * 1024)).toBe(false);
  });

  it('should sanitize pack and sticker file slugs for filenames', () => {
    expect(sanitizePackSlug('My Super Cool Sticker #1!')).toBe('my_super_cool_sticker_1');
    expect(sanitizePackSlug('Anime: Rem (Happy face)')).toBe('anime_rem_happy_face');
    expect(sanitizePackSlug('___')).toBe('sticker_pack');
  });
});
