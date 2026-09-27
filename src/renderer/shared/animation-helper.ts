import { StickerItem } from '../../types/models';

export type AnimationPlaybackMode = 'always' | 'hover' | 'reduced_motion';

export interface PlaybackResolution {
  srcPath: string;
  isAnimatedActive: boolean;
}

export interface AnimationTelemetry {
  isAnimated: boolean;
  frameCount: number;
  durationSeconds: number;
  durationText: string;
  formatLabel: string;
}

/**
 * Resolves the appropriate variant path depending on animation state and playback settings.
 */
export function resolvePlaybackPath(
  item: StickerItem,
  isHoveredOrActive: boolean,
  mode: AnimationPlaybackMode = 'hover'
): PlaybackResolution {
  const staticPath = item.variants.thumb?.filePath || item.originalPath;
  const animatedPath =
    item.variants.sticker?.filePath ||
    item.variants.emoji?.filePath ||
    item.originalPath;

  if (!item.isAnimated) {
    return { srcPath: staticPath, isAnimatedActive: false };
  }

  switch (mode) {
    case 'always':
      return { srcPath: animatedPath, isAnimatedActive: true };
    case 'hover':
      return isHoveredOrActive
        ? { srcPath: animatedPath, isAnimatedActive: true }
        : { srcPath: staticPath, isAnimatedActive: false };
    case 'reduced_motion':
      return isHoveredOrActive
        ? { srcPath: animatedPath, isAnimatedActive: true }
        : { srcPath: staticPath, isAnimatedActive: false };
    default:
      return { srcPath: staticPath, isAnimatedActive: false };
  }
}

/**
 * Calculates estimated duration and format telemetry for an animated sticker.
 */
export function getAnimationTelemetry(
  item: StickerItem,
  averageFrameDelayMs: number = 50
): AnimationTelemetry {
  const isAnimated = Boolean(item.isAnimated);
  const frameCount = item.frameCount || (isAnimated ? 2 : 1);
  const durationSeconds = isAnimated
    ? Number(((frameCount * averageFrameDelayMs) / 1000).toFixed(1))
    : 0;

  const durationText = isAnimated
    ? `${durationSeconds}s (${frameCount} frames)`
    : 'Static';

  const ext = (item.ext || '').replace('.', '').toUpperCase();
  const formatLabel = isAnimated ? `Animated ${ext || 'GIF'}` : ext || 'PNG';

  return {
    isAnimated,
    frameCount,
    durationSeconds,
    durationText,
    formatLabel,
  };
}
