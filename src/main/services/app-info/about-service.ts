import { app } from 'electron';
import os from 'os';
import { AboutInfo } from '../../../types/models';
import { getVaultRoot } from '../ingestion/paths';
import { getDatabaseDAL } from '../database/dal';
import { logger } from '../logger/logger';

export function getAboutInfo(): AboutInfo {
  let totalStickers = 0;
  try {
    const dal = getDatabaseDAL();
    const res = dal.searchItems({ limit: 1 });
    totalStickers = res.total;
  } catch {
    // In unit tests or before database initialization
  }

  const vault = getVaultRoot();
  const databasePath = `${vault}/.stickerchest/stickerchest.db`;
  const logPath = logger.getLogPath();

  let appVersion = '0.0.5';
  try {
    if (app && app.getVersion) {
      appVersion = app.getVersion();
    }
  } catch {
    // Unit tests fallback
  }

  return {
    appName: 'Sticker Chest',
    version: appVersion,
    commitHash: process.env.GIT_COMMIT_HASH || 'unknown',
    electronVersion: process.versions?.electron || 'unknown',
    chromeVersion: process.versions?.chrome || 'unknown',
    nodeVersion: process.versions?.node || process.version,
    v8Version: process.versions?.v8 || 'unknown',
    platform: process.platform,
    arch: process.arch,
    osRelease: `${os.type()} ${os.release()}`,
    vaultPath: vault,
    databasePath,
    logPath,
    totalStickers,
  };
}
