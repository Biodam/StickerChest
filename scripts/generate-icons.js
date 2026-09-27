import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const resourcesDir = path.resolve(process.cwd(), 'resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// Master SVG design for StickerVault
const appIconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#312e81" />
    </linearGradient>
    <linearGradient id="vaultGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="100%" stop-color="#0284c7" />
    </linearGradient>
    <linearGradient id="peelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.45" />
    </filter>
  </defs>

  <!-- Squircle Base -->
  <rect x="32" y="32" width="448" height="448" rx="104" fill="url(#bgGrad)" filter="url(#shadow)" />

  <!-- Sticker outline border -->
  <rect x="52" y="52" width="408" height="408" rx="84" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="6" />

  <!-- Sticker Vault Body (Shield/Vault Shape) -->
  <g transform="translate(128, 118)">
    <!-- Vault Outer Rim -->
    <circle cx="128" cy="128" r="108" fill="#1e1b4b" stroke="url(#vaultGrad)" stroke-width="12" />
    
    <!-- Vault Wheel spokes -->
    <circle cx="128" cy="128" r="80" fill="none" stroke="#6366f1" stroke-width="6" stroke-dasharray="16 16" />
    
    <!-- Vault Center Dial -->
    <circle cx="128" cy="128" r="48" fill="url(#vaultGrad)" />
    
    <!-- Center Sparkle Star / Sticker Keyhole -->
    <path d="M 128 98 L 135 121 L 158 128 L 135 135 L 128 158 L 121 135 L 98 128 L 121 121 Z" fill="#ffffff" />
  </g>

  <!-- Sticker Peel Corner Accent -->
  <path d="M 370 480 C 420 480 460 440 480 390 L 400 400 Z" fill="url(#peelGrad)" opacity="0.9" />
  <path d="M 400 400 L 480 390 C 440 460 390 480 370 480 Z" fill="#b45309" opacity="0.6" />
</svg>
`;

// Monochrome System Tray SVG (Clean high-contrast icon for taskbar/menubar)
const trayIconSvg = `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="12" fill="none" stroke="#ffffff" stroke-width="2.5" />
  <circle cx="16" cy="16" r="5" fill="#ffffff" />
  <line x1="16" y1="4" x2="16" y2="7" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="16" y1="25" x2="16" y2="28" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="4" y1="16" x2="7" y2="16" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
  <line x1="25" y1="16" x2="28" y2="16" stroke="#ffffff" stroke-width="2" stroke-linecap="round" />
</svg>
`;

async function generateIcons() {
  console.log('[IconGenerator] Generating master icon.png (512x512)...');
  const masterBuffer = await sharp(Buffer.from(appIconSvg))
    .resize(512, 512)
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(resourcesDir, 'icon.png'), masterBuffer);

  console.log('[IconGenerator] Generating tray icons...');
  const tray16 = await sharp(Buffer.from(trayIconSvg)).resize(16, 16).png().toBuffer();
  const tray32 = await sharp(Buffer.from(trayIconSvg)).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(resourcesDir, 'tray-icon.png'), tray16);
  fs.writeFileSync(path.join(resourcesDir, 'tray-icon@2x.png'), tray32);

  console.log('[IconGenerator] Generating multi-size Windows icon.ico...');
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    sizes.map((s) => sharp(masterBuffer).resize(s, s).png().toBuffer())
  );

  // Pack PNG buffers into a standard ICO file
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // 1 = ICO
  icoHeader.writeUInt16LE(sizes.length, 4); // Number of images

  const directoryEntries = [];
  let currentOffset = 6 + sizes.length * 16;

  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    const pngBuf = pngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0); // Width
    entry.writeUInt8(size === 256 ? 0 : size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(pngBuf.length, 8); // Image size in bytes
    entry.writeUInt32LE(currentOffset, 12); // File offset

    directoryEntries.push(entry);
    currentOffset += pngBuf.length;
  }

  const finalIcoBuffer = Buffer.concat([
    icoHeader,
    ...directoryEntries,
    ...pngBuffers,
  ]);

  fs.writeFileSync(path.join(resourcesDir, 'icon.ico'), finalIcoBuffer);
  console.log('[IconGenerator] Successfully generated resources/icon.ico and resources/icon.png!');
}

generateIcons().catch((err) => {
  console.error('[IconGenerator] Error generating icons:', err);
  process.exit(1);
});
