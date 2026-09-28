import { execFile, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { logger } from '../logger/logger';

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
    logger.info('PasteSimulator', `Generated Windows paste VBS script at ${vbsPath}`);
  } catch (err: any) {
    logger.error('PasteSimulator', `Failed to write paste script: ${err.message}`, err);
  }
  return vbsPath;
}

export function simulatePasteKeystroke(): Promise<boolean> {
  const startTime = Date.now();
  return new Promise((resolve) => {
    try {
      const platform = process.platform;
      logger.info('PasteSimulator', `Executing simulatePasteKeystroke on platform: ${platform}`);

      if (platform === 'win32') {
        const scriptPath = getWindowsPasteScriptPath();
        execFile('cscript', ['//nologo', scriptPath], (err, stdout, stderr) => {
          const duration = Date.now() - startTime;
          if (err) {
            logger.warn('PasteSimulator', `cscript failed (${duration}ms): ${err.message}, stderr: ${stderr}. Falling back to powershell`);
            exec(
              'powershell -WindowStyle Hidden -Command "(New-Object -ComObject WScript.Shell).SendKeys(\'^v\')"',
              (psErr, psStdout, psStderr) => {
                const psDuration = Date.now() - startTime;
                if (psErr) {
                  logger.error('PasteSimulator', `PowerShell fallback failed (${psDuration}ms): ${psErr.message}`, { psStderr });
                  resolve(false);
                } else {
                  logger.info('PasteSimulator', `PowerShell paste succeeded (${psDuration}ms)`, { psStdout });
                  resolve(true);
                }
              }
            );
          } else {
            logger.info('PasteSimulator', `cscript paste keystroke (^v) dispatched successfully in ${duration}ms`);
            resolve(true);
          }
        });
      } else if (platform === 'darwin') {
        const appleScript = 'tell application "System Events" to keystroke "v" using command down';
        execFile('osascript', ['-e', appleScript], (err) => {
          const duration = Date.now() - startTime;
          if (err) {
            logger.error('PasteSimulator', `macOS AppleScript paste failed (${duration}ms): ${err.message}`);
            resolve(false);
          } else {
            logger.info('PasteSimulator', `macOS paste keystroke dispatched in ${duration}ms`);
            resolve(true);
          }
        });
      } else if (platform === 'linux') {
        exec('xdotool key --clearmodifiers ctrl+v', (err) => {
          const duration = Date.now() - startTime;
          if (err) {
            logger.error('PasteSimulator', `Linux xdotool paste failed (${duration}ms): ${err.message}`);
            resolve(false);
          } else {
            logger.info('PasteSimulator', `Linux xdotool paste dispatched in ${duration}ms`);
            resolve(true);
          }
        });
      } else {
        logger.warn('PasteSimulator', `Unsupported platform for auto-paste: ${platform}`);
        resolve(false);
      }
    } catch (unexpected: any) {
      logger.error('PasteSimulator', `Unexpected error simulating paste: ${unexpected.message}`, unexpected);
      resolve(false);
    }
  });
}
