import { execFile, execFileSync, exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { app } from 'electron';
import { logger } from '../logger/logger';

export interface PasteSimulationOptions {
  filePath?: string;
  text?: string;
  hwnd?: string;
}

export interface TargetContext {
  hwnd?: string;
  caretX?: number;
  caretY?: number;
}

let cachedVbsPath: string | null = null;

export function getWinPasteExePath(): string | null {
  const possiblePaths = [
    path.join(process.resourcesPath || '', 'resources', 'bin', 'win-paste.exe'),
    path.join(process.resourcesPath || '', 'bin', 'win-paste.exe'),
  ];

  try {
    possiblePaths.push(path.join(app.getAppPath(), 'resources', 'bin', 'win-paste.exe'));
  } catch {}

  possiblePaths.push(path.resolve(process.cwd(), 'resources', 'bin', 'win-paste.exe'));

  for (const p of possiblePaths) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }
  return null;
}

export function detectTargetContext(): TargetContext {
  if (process.platform !== 'win32') return {};
  const exe = getWinPasteExePath();
  if (!exe) return {};

  try {
    const output = execFileSync(exe, ['get-target'], { encoding: 'utf-8', timeout: 400 });
    const lines = output.trim().split('\n');
    const result: TargetContext = {};
    for (const line of lines) {
      const parts = line.trim().split('=');
      if (parts[0] === 'HWND' && parts[1] && parts[1] !== '0') result.hwnd = parts[1];
      if (parts[0] === 'CARET_X' && parts[1]) result.caretX = parseInt(parts[1], 10);
      if (parts[0] === 'CARET_Y' && parts[1]) result.caretY = parseInt(parts[1], 10);
    }
    logger.info('TargetContext', 'Detected target context before picker open', result);
    return result;
  } catch (err: any) {
    logger.warn('TargetContext', `Failed to detect target context: ${err.message}`);
    return {};
  }
}

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

function fallbackWindowsPaste(startTime: number, resolve: (val: boolean) => void): void {
  const scriptPath = getWindowsPasteScriptPath();
  execFile('cscript', ['//nologo', scriptPath], (err) => {
    const duration = Date.now() - startTime;
    if (err) {
      logger.warn('PasteSimulator', `cscript fallback failed (${duration}ms): ${err.message}. Trying PowerShell...`);
      exec(
        'powershell -WindowStyle Hidden -Command "(New-Object -ComObject WScript.Shell).SendKeys(\'^v\')"',
        (psErr) => {
          const psDuration = Date.now() - startTime;
          if (psErr) {
            logger.error('PasteSimulator', `PowerShell fallback failed (${psDuration}ms): ${psErr.message}`);
            resolve(false);
          } else {
            logger.info('PasteSimulator', `PowerShell paste succeeded (${psDuration}ms)`);
            resolve(true);
          }
        }
      );
    } else {
      logger.info('PasteSimulator', `cscript paste keystroke dispatched successfully in ${duration}ms`);
      resolve(true);
    }
  });
}

export function simulatePasteKeystroke(options?: PasteSimulationOptions): Promise<boolean> {
  const startTime = Date.now();
  return new Promise((resolve) => {
    try {
      const platform = process.platform;
      logger.info('PasteSimulator', `Executing simulatePasteKeystroke on platform: ${platform}`, options);

      if (platform === 'win32') {
        const winPasteExe = getWinPasteExePath();
        if (winPasteExe) {
          logger.info('PasteSimulator', `Using native win-paste helper: ${winPasteExe}`);
          const args: string[] = [];
          if (options?.hwnd) {
            args.push('--hwnd', options.hwnd);
          }
          if (options?.filePath) {
            args.push('--file', options.filePath);
          }
          if (options?.text) {
            args.push('--text', options.text);
          }

          execFile(winPasteExe, args, (err, stdout, stderr) => {
            const duration = Date.now() - startTime;
            if (err || !stdout.includes('SUCCESS')) {
              logger.warn('PasteSimulator', `win-paste.exe returned non-zero (${duration}ms): ${err?.message || stderr}. Using fallback...`);
              fallbackWindowsPaste(startTime, resolve);
            } else {
              logger.info('PasteSimulator', `Native win-paste.exe dispatched multi-format paste in ${duration}ms!`);
              resolve(true);
            }
          });
          return;
        }

        // Native binary not found; use VBS fallback
        logger.info('PasteSimulator', 'win-paste.exe not found; using VBS fallback');
        fallbackWindowsPaste(startTime, resolve);
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
