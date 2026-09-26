import { contextBridge, ipcRenderer } from 'electron';
import { StickerVaultAPI } from '../types/ipc';

const api: StickerVaultAPI = {
  searchItems: (options) => ipcRenderer.invoke('db:search', options),
  getItem: (id) => ipcRenderer.invoke('db:getItem', id),
  toggleFavorite: (itemId) => ipcRenderer.invoke('db:toggleFavorite', itemId),
  updateMetadata: (itemId, metadata) => ipcRenderer.invoke('db:updateMetadata', itemId, metadata),

  copyItemToClipboard: (itemId, tier) => ipcRenderer.invoke('clipboard:copyItem', itemId, tier),

  scanSourceFolder: (forceReprocess) => ipcRenderer.invoke('vault:scan', forceReprocess),
  onIngestionProgress: (callback) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('vault:progress', handler);
    return () => ipcRenderer.removeListener('vault:progress', handler);
  },

  tagItemWithGemini: (itemId) => ipcRenderer.invoke('gemini:tagItem', itemId),
  testGeminiKey: (apiKey) => ipcRenderer.invoke('gemini:testKey', apiKey),

  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  selectFolderDialog: () => ipcRenderer.invoke('dialog:selectFolder'),

  hidePicker: () => ipcRenderer.invoke('window:hidePicker'),
  openManager: () => ipcRenderer.invoke('window:openManager'),
};

contextBridge.exposeInMainWorld('stickerVault', api);
