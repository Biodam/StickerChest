import fs from 'fs';
import path from 'path';
import { app } from 'electron';

let logFilePath: string | null = null;

function ensureLogFile(): string {
  if (logFilePath) return logFilePath;

  let dir: string;
  try {
    dir = path.join(app.getPath('userData'), 'logs');
  } catch {
    dir = path.join(process.cwd(), '.data', 'logs');
  }

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  logFilePath = path.join(dir, 'picker-paste.log');
  return logFilePath;
}

export function writeLog(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', tag: string, message: string, meta?: any): void {
  const timestamp = new Date().toISOString();
  const metaStr = meta ? ` | ${typeof meta === 'object' ? JSON.stringify(meta) : String(meta)}` : '';
  const line = `[${timestamp}] [${level}] [${tag}] ${message}${metaStr}\n`;

  // 1. Always output to standard console
  if (level === 'ERROR') {
    console.error(line.trimEnd());
  } else if (level === 'WARN') {
    console.warn(line.trimEnd());
  } else {
    console.log(line.trimEnd());
  }

  // 2. Append to persistent log file
  try {
    const file = ensureLogFile();
    fs.appendFileSync(file, line, 'utf-8');
  } catch (err) {
    console.error('[Logger] Failed to write to log file:', err);
  }
}

export const logger = {
  info: (tag: string, msg: string, meta?: any) => writeLog('INFO', tag, msg, meta),
  warn: (tag: string, msg: string, meta?: any) => writeLog('WARN', tag, msg, meta),
  error: (tag: string, msg: string, meta?: any) => writeLog('ERROR', tag, msg, meta),
  debug: (tag: string, msg: string, meta?: any) => writeLog('DEBUG', tag, msg, meta),
  getLogPath: () => ensureLogFile(),
  readRecentLogs: (maxLines = 100): string[] => {
    try {
      const file = ensureLogFile();
      if (!fs.existsSync(file)) return [];
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.trim().split('\n');
      return lines.slice(-maxLines);
    } catch {
      return [];
    }
  },
};
