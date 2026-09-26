import path from 'path';
import fs from 'fs';
import { app } from 'electron';
import { ImageTier } from '../../../types/models';

let customVaultRoot: string | null = null;

export function setCustomVaultRoot(rootPath: string): void {
  customVaultRoot = rootPath;
}

export function getVaultRoot(): string {
  if (customVaultRoot) return customVaultRoot;

  try {
    const userData = app.getPath('userData');
    return path.join(userData, 'vault');
  } catch {
    return path.resolve(process.cwd(), '.data', 'vault');
  }
}

export function ensureVaultDirectories(): void {
  const root = getVaultRoot();

  // 1. Sources directory for user organization
  const sourcesDir = path.join(root, 'sources');
  if (!fs.existsSync(sourcesDir)) {
    fs.mkdirSync(sourcesDir, { recursive: true });
  }

  // 2. .stickervault internal metadata & variants directory
  const metaDir = path.join(root, '.stickervault');
  if (!fs.existsSync(metaDir)) {
    fs.mkdirSync(metaDir, { recursive: true });
  }

  const tiers: ImageTier[] = ['sticker', 'emoji', 'thumb'];
  for (const tier of tiers) {
    const dir = path.join(metaDir, 'variants', tier);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export function getVariantOutputPath(hash: string, tier: ImageTier, ext = '.webp'): string {
  const root = getVaultRoot();
  return path.join(root, '.stickervault', 'variants', tier, `${hash}${ext}`);
}

export function getRelativePath(fullPath: string): string {
  const root = getVaultRoot();
  if (fullPath.startsWith(root)) {
    const rel = path.relative(root, fullPath);
    return rel.replace(/\\/g, '/');
  }
  return fullPath.replace(/\\/g, '/');
}

export function resolveVaultPath(storedPath: string): string {
  if (!storedPath) return storedPath;
  const root = getVaultRoot();

  // 1. If already absolute and exists on local filesystem, return it
  if (path.isAbsolute(storedPath) && fs.existsSync(storedPath)) {
    return storedPath;
  }

  const normalized = storedPath.replace(/\\/g, '/');

  // 2. Direct relative resolution against active root
  const directPath = path.resolve(root, normalized);
  if (fs.existsSync(directPath)) {
    return directPath;
  }

  // 3. Variant tiers resolution (.stickervault/variants/<tier>, root/<tier>, or AppData vault fallback)
  const tierMatch =
    normalized.match(/(?:variants|vault)[\/\\](sticker|emoji|thumb)[\/\\]([^\/\\]+)$/i) ||
    normalized.match(/(?:^|[\/\\])(sticker|emoji|thumb)[\/\\]([^\/\\]+)$/i);
  if (tierMatch) {
    const tier = tierMatch[1].toLowerCase();
    const file = tierMatch[2];

    const cand1 = path.resolve(root, '.stickervault', 'variants', tier, file);
    if (fs.existsSync(cand1)) return cand1;

    const cand2 = path.resolve(root, 'vault', tier, file);
    if (fs.existsSync(cand2)) return cand2;

    const cand3 = path.resolve(root, tier, file);
    if (fs.existsSync(cand3)) return cand3;

    try {
      const userData = app.getPath('userData');
      const appData1 = path.resolve(userData, 'vault', tier, file);
      if (fs.existsSync(appData1)) return appData1;

      const appData2 = path.resolve(userData, 'vault', '.stickervault', 'variants', tier, file);
      if (fs.existsSync(appData2)) return appData2;
    } catch {
      // In non-Electron / test runners
    }
  }

  // 4. Handle cross-platform path migration markers (.stickervault, sources, vault)
  for (const marker of ['.stickervault', 'sources', 'vault']) {
    const idx = normalized.indexOf(marker);
    if (idx !== -1) {
      const candidate = path.resolve(root, normalized.substring(idx));
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  // 5. Fallback to checking by filename in sources or root
  const filename = path.basename(normalized);
  const inSources = path.resolve(root, 'sources', filename);
  if (fs.existsSync(inSources)) return inSources;

  const inRoot = path.resolve(root, filename);
  if (fs.existsSync(inRoot)) return inRoot;

  return directPath;
}
