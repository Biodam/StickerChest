import { ipcMain } from 'electron';
import { logger } from '../services/logger/logger';

export function registerLoggerIpcHandlers(): void {
  ipcMain.handle('logger:log', (_event, level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', tag: string, message: string, meta?: any) => {
    if (level === 'ERROR') logger.error(tag, message, meta);
    else if (level === 'WARN') logger.warn(tag, message, meta);
    else if (level === 'DEBUG') logger.debug(tag, message, meta);
    else logger.info(tag, message, meta);
    return true;
  });

  ipcMain.handle('logger:getRecentLogs', (_event, maxLines?: number) => {
    return logger.readRecentLogs(maxLines || 100);
  });

  ipcMain.handle('logger:getLogPath', () => {
    return logger.getLogPath();
  });
}
