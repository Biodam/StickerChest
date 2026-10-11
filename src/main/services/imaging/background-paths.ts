import path from 'path';

/**
 * Pure helper: builds a non-colliding output path next to the original,
 * e.g. /a/cat.png -> /a/cat-nobg.png (then cat-nobg-2.png, ...).
 */
export function buildNoBgPath(originalPath: string, exists: (candidate: string) => boolean): string {
  const dir = path.dirname(originalPath);
  const base = path.basename(originalPath, path.extname(originalPath)).replace(/-nobg(-\d+)?$/, '');

  let candidate = path.join(dir, `${base}-nobg.png`);
  let counter = 2;
  while (exists(candidate)) {
    candidate = path.join(dir, `${base}-nobg-${counter}.png`);
    counter++;
  }
  return candidate;
}

export function guessMimeType(filePath: string): string {
  switch (path.extname(filePath).toLowerCase()) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'image/png';
  }
}
