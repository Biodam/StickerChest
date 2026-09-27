import path from 'path';

/**
 * Common noise tokens in image filenames to ignore as tags
 */
const IGNORED_TOKENS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg',
  'image', 'img', 'pic', 'picture', 'photo', 'screenshot',
  'sticker', 'stickers', 'emoji', 'emojis', 'raw', 'thumb', 'thumbnail',
  'discord', 'telegram', 'whatsapp', 'slack', 'export', 'download',
  'copy', 'edit', 'final', 'new', 'temp', 'asset', 'assets',
]);

/**
 * Extracts descriptive keyword tags (characters, emotions, actions) from an image filename.
 * Supports CamelCase, snake_case, kebab-case, space-separated, and dot-separated names.
 */
export function parseTagsFromFilename(filenameOrPath: string): string[] {
  if (!filenameOrPath) return [];

  // 1. Get basename without extension
  const parsed = path.parse(filenameOrPath);
  let name = parsed.name;

  // 2. Strip common suffix noise: (1), (2), copy, resolution like 512x512, 1080p, hashes (>=16 hex chars)
  name = name.replace(/\(\d+\)/g, ' '); // (1), (2)
  name = name.replace(/\[[^\]]*\]/g, ' '); // [tags] or [1080p]
  name = name.replace(/\b\d+x\d+\b/gi, ' '); // 512x512, 128x128
  name = name.replace(/\b(1080p|720p|4k|2k|hd)\b/gi, ' ');
  name = name.replace(/\b[0-9a-f]{16,}\b/gi, ' '); // long hashes/hex strings
  name = name.replace(/\b(IMG|DSC|Screenshot|Capture)[-_]?\d+/gi, ' '); // IMG_20240926

  // 3. Handle CamelCase boundaries: e.g. "AnyaSmug" -> "Anya Smug", "HatsuneMiku" -> "Hatsune Miku"
  name = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
  name = name.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  // 4. Split by delimiters: underscores, hyphens, dots, pluses, spaces, commas
  const rawTokens = name.split(/[\s_\-.,+~|/]+/);

  const cleanTokens: string[] = [];
  for (const raw of rawTokens) {
    const clean = raw.trim().toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
    if (!clean) continue;
    // Skip if token is too short (1 char), pure numbers, or resolution format like 512x512
    if (clean.length <= 1 || /^\d+$/.test(clean) || /^\d+x\d+$/i.test(clean)) continue;
    // Skip ignored common noise words
    if (IGNORED_TOKENS.has(clean)) continue;

    cleanTokens.push(clean);
  }

  const result = new Set<string>();

  // Add individual keyword tokens
  cleanTokens.forEach((t) => result.add(t));

  // If there are 2 or 3 tokens (e.g. ["hatsune", "miku"] or ["anya", "smug"]),
  // also add the full joined phrase (e.g. "hatsune miku" or "anya smug")
  if (cleanTokens.length >= 2 && cleanTokens.length <= 4) {
    result.add(cleanTokens.join(' '));
  }

  return Array.from(result);
}
