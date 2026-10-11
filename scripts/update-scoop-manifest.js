import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const REPO_RELEASES = 'https://github.com/Biodam/StickerChest/releases/download';

/** Pure: returns a new Scoop manifest pointing at the given version and SHA-256. */
export function updateManifest(manifest, version, sha256) {
  const exe = `Sticker.Chest.${version}.exe`;
  return {
    ...manifest,
    version,
    architecture: {
      ...manifest.architecture,
      '64bit': {
        ...manifest.architecture?.['64bit'],
        url: `${REPO_RELEASES}/v${version}/${exe}`,
        hash: sha256,
      },
    },
    shortcuts: [[exe, 'Sticker Chest']],
  };
}

export function sha256File(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

// CLI: node scripts/update-scoop-manifest.js <version|vVersion> <path-to-portable-exe>
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [rawVersion, exePath] = process.argv.slice(2);
  if (!rawVersion || !exePath) {
    console.error('Usage: node scripts/update-scoop-manifest.js <version> <portable-exe-path>');
    process.exit(1);
  }
  const version = rawVersion.replace(/^v/, '');
  const manifestPath = path.resolve(process.cwd(), 'bucket', 'sticker-chest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  const updated = updateManifest(manifest, version, sha256File(exePath));
  fs.writeFileSync(manifestPath, JSON.stringify(updated, null, 2) + '\n', 'utf-8');
  console.log(`Scoop manifest updated to v${version} (sha256 ${updated.architecture['64bit'].hash})`);
}
