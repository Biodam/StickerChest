import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, protocol, net } from 'electron';
import { pathToFileURL } from 'url';
import { createMainWindow, showMainWindow } from './windows/mainWindow';
import { createPickerWindow } from './windows/pickerWindow';
import { createTray, destroyTray, isAppQuitting, setAppQuitting } from './windows/tray';
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from './shortcuts/globalShortcuts';
import { registerIpcHandlers } from './ipc';
import { resolveVaultPath } from './services/ingestion/paths';
import { loadSettings } from './services/settings/settings-store';
import { setupApplicationMenu } from './windows/menu';

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  console.log('[App] Another instance of Sticker Chest is already running. Quitting secondary process.');
  app.quit();
} else {
  app.on('second-instance', () => {
    console.log('[App] Secondary instance launch attempted. Bringing existing window to front.');
    showMainWindow();
  });

  protocol.registerSchemesAsPrivileged([
    { scheme: 'chest', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
    { scheme: 'vault', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
  ]);

  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception in Main process:', err);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection in Main process:', reason);
  });

  app.whenReady().then(() => {
  // Register custom protocol for local chest images
  const handleMediaRequest = async (request: Request) => {
    try {
      let targetPath: string | null = null;
      try {
        const parsed = new URL(request.url);
        targetPath = parsed.searchParams.get('path');
      } catch {
        // Fall through
      }

      if (!targetPath) {
        let raw = request.url.replace(/^(?:chest|vault):\/\//i, '');
        if (raw.startsWith('media/')) {
          raw = raw.slice('media/'.length);
        } else if (raw.startsWith('media?path=')) {
          raw = raw.slice('media?path='.length);
        }
        targetPath = decodeURIComponent(raw);

        // Fix Windows drive letter stripped colon by Chromium (e.g. "c/Users/..." -> "C:/Users/...")
        if (/^[a-zA-Z]\//.test(targetPath)) {
          targetPath = targetPath[0].toUpperCase() + ':/' + targetPath.slice(2);
        }
      }

      const resolved = resolveVaultPath(targetPath);
      if (!resolved || !fs.existsSync(resolved)) {
        console.warn('[ChestProtocol] Image file not found:', resolved, 'from request:', request.url);
        return new Response('Not Found', { status: 404 });
      }

      try {
        return await net.fetch(pathToFileURL(resolved).toString());
      } catch (fetchErr) {
        console.warn('[ChestProtocol] net.fetch failed, reading file directly:', fetchErr);
        const buffer = await fs.promises.readFile(resolved);
        const ext = path.extname(resolved).toLowerCase();
        const mimeTypes: Record<string, string> = {
          '.webp': 'image/webp',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.gif': 'image/gif',
          '.avif': 'image/avif',
        };
        return new Response(buffer, {
          headers: {
            'Content-Type': mimeTypes[ext] || 'application/octet-stream',
            'Cache-Control': 'max-age=31536000, immutable',
          },
        });
      }
    } catch (err) {
      console.error('[ChestProtocol] Handler error:', err);
      return new Response('Internal Error', { status: 500 });
    }
  };

  protocol.handle('chest', handleMediaRequest);
  protocol.handle('vault', handleMediaRequest);

  // Register IPC handlers
  registerIpcHandlers();

  // Create windows
  createMainWindow();
  createPickerWindow();

  // Create system tray companion
  createTray();

  // Setup application menu (File, Edit, View, Help -> About)
  setupApplicationMenu();

  // Register global shortcuts (e.g. Win+/ on Windows, Control+/ on macOS to toggle floating picker)
  const settings = loadSettings();
  registerGlobalShortcuts(settings.globalShortcut);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
      createPickerWindow();
    }
  });
});

app.on('before-quit', () => {
  setAppQuitting(true);
});

app.on('will-quit', () => {
  console.log('[App] will-quit');
  unregisterGlobalShortcuts();
  destroyTray();
});

app.on('window-all-closed', () => {
  console.log('[App] window-all-closed');
  // If not explicitly quitting via Tray or exit menu, keep app alive in background for Quick Picker
  if (isAppQuitting()) {
    app.quit();
  }
});
}

