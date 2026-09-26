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
  const tiers: ImageTier[] = ['raw', 'sticker', 'emoji', 'thumb'];

  for (const tier of tiers) {
    const dir = path.join(root, tier);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

export function getVariantOutputPath(hash: string, tier: ImageTier, ext = '.webp'): string {
  const root = getVaultRoot();
  return path.join(root, tier, `${hash}${ext}`);
}
