import { describe, it, expect } from 'vitest';
import {
  resolvePlaybackPath,
  getAnimationTelemetry,
} from '../../src/renderer/shared/animation-helper';
import { StickerItem } from '../../src/types/models';

function createMockSticker(isAnimated: boolean, frameCount: number = 1): StickerItem {
  return {
    id: 'mock-1',
    sha256Hash: 'hash123',
    filename: 'anya-dance.gif',
    originalPath: 'originals/anya-dance.gif',
    ext: '.gif',
    mimeType: 'image/gif',
    width: 320,
    height: 320,
    fileSizeBytes: 204800,
    isAnimated,
    frameCount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: {
      raw: null,
      sticker: {
        id: 'var-1',
        itemId: 'mock-1',
        tier: 'sticker',
        filePath: 'variants/sticker.webp',
        format: 'webp',
        width: 320,
        height: 320,
        fileSizeBytes: 102400,
        createdAt: new Date().toISOString(),
      },
      emoji: null,
      thumb: {
        id: 'var-2',
        itemId: 'mock-1',
        tier: 'thumb',
        filePath: 'variants/thumb.webp',
        format: 'webp',
        width: 96,
        height: 96,
        fileSizeBytes: 12000,
        createdAt: new Date().toISOString(),
      },
    },
    metadata: null,
    tags: ['dance', 'anya'],
    userTags: [],
    customAttributes: {},
    usage: {
      itemId: 'mock-1',
      isFavorite: false,
      copyCount: 0,
      lastCopiedAt: null,
    },
  };
}

describe('Animation Controls & Telemetry Helper', () => {
  it('should return static thumbnail for non-animated stickers in all modes', () => {
    const staticItem = createMockSticker(false);
    expect(resolvePlaybackPath(staticItem, false, 'always').srcPath).toBe('variants/thumb.webp');
    expect(resolvePlaybackPath(staticItem, true, 'hover').srcPath).toBe('variants/thumb.webp');
    expect(resolvePlaybackPath(staticItem, true, 'reduced_motion').srcPath).toBe('variants/thumb.webp');
  });

  it('should resolve animated path when mode is always', () => {
    const animItem = createMockSticker(true, 12);
    const resultIdle = resolvePlaybackPath(animItem, false, 'always');
    const resultHover = resolvePlaybackPath(animItem, true, 'always');

    expect(resultIdle.srcPath).toBe('variants/sticker.webp');
    expect(resultIdle.isAnimatedActive).toBe(true);
    expect(resultHover.srcPath).toBe('variants/sticker.webp');
    expect(resultHover.isAnimatedActive).toBe(true);
  });

  it('should switch between static thumbnail and animated sticker in hover mode', () => {
    const animItem = createMockSticker(true, 24);

    const idle = resolvePlaybackPath(animItem, false, 'hover');
    expect(idle.srcPath).toBe('variants/thumb.webp');
    expect(idle.isAnimatedActive).toBe(false);

    const active = resolvePlaybackPath(animItem, true, 'hover');
    expect(active.srcPath).toBe('variants/sticker.webp');
    expect(active.isAnimatedActive).toBe(true);
  });

  it('should generate accurate animation telemetry', () => {
    const staticItem = createMockSticker(false);
    const animItem = createMockSticker(true, 30);

    const staticTelemetry = getAnimationTelemetry(staticItem);
    expect(staticTelemetry.isAnimated).toBe(false);
    expect(staticTelemetry.durationText).toBe('Static');

    const animTelemetry = getAnimationTelemetry(animItem, 50);
    expect(animTelemetry.isAnimated).toBe(true);
    expect(animTelemetry.frameCount).toBe(30);
    expect(animTelemetry.durationSeconds).toBe(1.5);
    expect(animTelemetry.durationText).toBe('1.5s (30 frames)');
    expect(animTelemetry.formatLabel).toBe('Animated GIF');
  });
});
