import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const resourcesDir = path.resolve(process.cwd(), 'resources');
if (!fs.existsSync(resourcesDir)) {
  fs.mkdirSync(resourcesDir, { recursive: true });
}

// Crisp System Tray Mimic Chest Silhouette (high-contrast for Windows taskbar & macOS dark/light menubars)
const trayIconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#ffffff" viewBox="0 0 256 256">
  <path d="M184,40H72A56.06,56.06,0,0,0,16,96v96a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V96A56.06,56.06,0,0,0,184,40Zm40,56v8H192V56.8A40.07,40.07,0,0,1,224,96Zm-88,40H120V104h16Zm-24,16h32a8,8,0,0,0,8-8V120h24v72H80V120h24v24A8,8,0,0,0,112,152Zm40-48V96a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v8H80V56h96v48ZM64,56.8V104H32V96A40.07,40.07,0,0,1,64,56.8ZM32,120H64v72H32Zm192,72H192V120h32v72Z"></path>
</svg>
`;

async function generateIcons() {
  const sourceJpg = path.join(resourcesDir, 'source-icon.jpg');
  let masterBuffer;

  if (fs.existsSync(sourceJpg)) {
    console.log('[IconGenerator] Processing source-icon.jpg into transparent squircle...');
    // Squircle mask with standard macOS/Windows rounded corners
    const squircleMaskSvg = `
      <svg width="512" height="512">
        <rect x="0" y="0" width="512" height="512" rx="115" ry="115" fill="#ffffff" />
      </svg>
    `;

    masterBuffer = await sharp(sourceJpg)
      .extract({ left: 144, top: 144, width: 736, height: 736 })
      .resize(512, 512)
      .composite([{ input: Buffer.from(squircleMaskSvg), blend: 'dest-in' }])
      .png()
      .toBuffer();
  } else {
    console.warn('[IconGenerator] source-icon.jpg not found, generating fallback SVG icon...');
    const fallbackSvg = `
      <svg width="512" height="512">
        <rect width="512" height="512" rx="115" fill="#1e1b4b" />
        <circle cx="256" cy="256" r="120" fill="#f59e0b" />
      </svg>
    `;
    masterBuffer = await sharp(Buffer.from(fallbackSvg)).resize(512, 512).png().toBuffer();
  }

  // 1. Save 512x512 Master icon.png
  fs.writeFileSync(path.join(resourcesDir, 'icon.png'), masterBuffer);
  console.log('[IconGenerator] Saved resources/icon.png (512x512)');

  // 2. Generate System Tray Icons
  console.log('[IconGenerator] Generating tray icons...');
  const tray16 = await sharp(Buffer.from(trayIconSvg)).resize(16, 16).png().toBuffer();
  const tray32 = await sharp(Buffer.from(trayIconSvg)).resize(32, 32).png().toBuffer();
  fs.writeFileSync(path.join(resourcesDir, 'tray-icon.png'), tray16);
  fs.writeFileSync(path.join(resourcesDir, 'tray-icon@2x.png'), tray32);

  // 3. Generate Multi-Size Windows ICO file
  console.log('[IconGenerator] Packing multi-size Windows icon.ico...');
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = await Promise.all(
    sizes.map((s) => sharp(masterBuffer).resize(s, s).png().toBuffer())
  );

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
  console.log('[IconGenerator] Successfully generated resources/icon.ico!');
}

generateIcons().catch((err) => {
  console.error('[IconGenerator] Error generating icons:', err);
  process.exit(1);
});
