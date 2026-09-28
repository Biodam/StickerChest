import { execFile, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

let cachedVbsPath: string | null = null;

function getWindowsPasteScriptPath(): string {
  if (cachedVbsPath && fs.existsSync(cachedVbsPath)) {
    return cachedVbsPath;
  }
  const vbsPath = path.join(os.tmpdir(), 'stickerchest_paste.vbs');
  try {
    fs.writeFileSync(
      vbsPath,
      'Set w = CreateObject("WScript.Shell")\r\nWScript.Sleep 30\r\nw.SendKeys "^v"\r\n',
      'utf-8'
    );
    cachedVbsPath = vbsPath;
  } catch (err) {
    console.error('[PasteSimulator] Failed to write paste script:', err);
  }
  return vbsPath;
}

export function simulatePasteKeystroke(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const platform = process.platform;

      if (platform === 'win32') {
        const scriptPath = getWindowsPasteScriptPath();
        execFile('cscript', ['//nologo', scriptPath], (err) => {
          if (err) {
            console.warn('[PasteSimulator] cscript failed, falling back to powershell:', err.message);
            exec(
              'powershell -WindowStyle Hidden -Command "(New-Object -ComObject WScript.Shell).SendKeys(\'^v\')"',
              (psErr) => {
                if (psErr) {
                  console.error('[PasteSimulator] Windows paste simulation failed:', psErr);
                  resolve(false);
                } else {
                  resolve(true);
                }
              }
            );
          } else {
            resolve(true);
          }
        });
      } else if (platform === 'darwin') {
        const appleScript = 'tell application "System Events" to keystroke "v" using command down';
        execFile('osascript', ['-e', appleScript], (err) => {
          if (err) {
            console.error('[PasteSimulator] macOS AppleScript paste failed:', err);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } else if (platform === 'linux') {
        exec('xdotool key --clearmodifiers ctrl+v', (err) => {
          if (err) {
            console.error('[PasteSimulator] Linux xdotool paste failed:', err);
            resolve(false);
          } else {
            resolve(true);
          }
        });
      } else {
        console.warn('[PasteSimulator] Unsupported platform for auto-paste:', platform);
        resolve(false);
      }
    } catch (unexpected) {
      console.error('[PasteSimulator] Unexpected error simulating paste:', unexpected);
      resolve(false);
    }
  });
}
