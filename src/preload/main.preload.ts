import { contextBridge, ipcRenderer } from 'electron';
import { StickerChestAPI } from '../types/ipc';

const api: StickerChestAPI = {
  searchItems: (options) => ipcRenderer.invoke('db:search', options),
  getFacets: () => ipcRenderer.invoke('db:getFacets'),
  getItem: (id) => ipcRenderer.invoke('db:getItem', id),
  toggleFavorite: (itemId) => ipcRenderer.invoke('db:toggleFavorite', itemId),
  updateMetadata: (itemId, metadata) => ipcRenderer.invoke('db:updateMetadata', itemId, metadata),

  copyItemToClipboard: (itemId, tier) => ipcRenderer.invoke('clipboard:copyItem', itemId, tier),
  copyAndPasteItem: (itemId, tier) => ipcRenderer.invoke('clipboard:copyAndPasteItem', itemId, tier),

  // Bulk Operations
  deleteItems: (itemIds) => ipcRenderer.invoke('db:deleteItems', itemIds),
  bulkAddTags: (itemIds, tags) => ipcRenderer.invoke('db:bulkAddTags', itemIds, tags),
  bulkRemoveTags: (itemIds, tags) => ipcRenderer.invoke('db:bulkRemoveTags', itemIds, tags),
  bulkToggleFavorite: (itemIds, favorite) => ipcRenderer.invoke('db:bulkToggleFavorite', itemIds, favorite),
  bulkSetCustomAttribute: (itemIds, key, value) => ipcRenderer.invoke('db:bulkSetCustomAttribute', itemIds, key, value),

  // Vault & Ingestion
  ingestFiles: (filePaths) => ipcRenderer.invoke('vault:ingestFiles', filePaths),
  scanSourceFolder: (forceReprocess, folderPath) => ipcRenderer.invoke('vault:scan', folderPath, forceReprocess),
  onIngestionProgress: (callback) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('vault:progress', handler);
    return () => ipcRenderer.removeListener('vault:progress', handler);
  },
  showItemInFolder: (filePath) => ipcRenderer.invoke('vault:showItemInFolder', filePath),

  tagItemWithGemini: (itemId) => ipcRenderer.invoke('gemini:tagItem', itemId),
  batchTagUntagged: () => ipcRenderer.invoke('gemini:batchTag'),
  getUntaggedCount: () => ipcRenderer.invoke('gemini:getUntaggedCount'),
  testGeminiKey: (apiKey, model) => ipcRenderer.invoke('gemini:testKey', apiKey, model),

  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  selectFolderDialog: () => ipcRenderer.invoke('dialog:selectFolder'),
  onThemeChanged: (callback) => {
    const handler = (_event: any, theme: string) => callback(theme);
    ipcRenderer.on('theme:changed', handler);
    return () => ipcRenderer.removeListener('theme:changed', handler);
  },

  // Vault Backup, Restore & Pack Exporters
  createVaultBackup: (customFilePath) => ipcRenderer.invoke('export:createBackup', customFilePath),
  restoreVaultBackup: (options) => ipcRenderer.invoke('export:restoreBackup', options),
  exportStickerPack: (options) => ipcRenderer.invoke('export:exportStickerPack', options),
  onExportProgress: (callback) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('export:progress', handler);
    return () => ipcRenderer.removeListener('export:progress', handler);
  },

  // Google Drive Cloud Sync
  syncGetAccountInfo: () => ipcRenderer.invoke('sync:getAccountInfo'),
  syncConnectGoogleDrive: (clientId) => ipcRenderer.invoke('sync:connectGoogleDrive', clientId),
  syncDisconnectGoogleDrive: () => ipcRenderer.invoke('sync:disconnectGoogleDrive'),
  syncTriggerNow: () => ipcRenderer.invoke('sync:triggerSync'),
  onSyncProgress: (callback) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('sync:progress', handler);
    return () => ipcRenderer.removeListener('sync:progress', handler);
  },

  hidePicker: () => ipcRenderer.invoke('window:hidePicker'),
  openManager: () => ipcRenderer.invoke('window:openManager'),
};

contextBridge.exposeInMainWorld('stickerChest', api);
contextBridge.exposeInMainWorld('stickerVault', api);
