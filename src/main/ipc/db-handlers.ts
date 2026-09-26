import { ipcMain } from 'electron';
import { getDatabaseDAL } from '../services/database/dal';
import { SearchFilterOptions } from '../../types/models';

export function registerDbIpcHandlers(): void {
  const dal = getDatabaseDAL();

  ipcMain.handle('db:search', async (_event, options: SearchFilterOptions) => {
    try {
      return dal.searchItems(options);
    } catch (err: any) {
      console.error('IPC db:search error:', err);
      return { items: [], total: 0 };
    }
  });

  ipcMain.handle('db:getItem', async (_event, id: string) => {
    try {
      return dal.getItemById(id);
    } catch (err: any) {
      console.error('IPC db:getItem error:', err);
      return null;
    }
  });

  ipcMain.handle('db:toggleFavorite', async (_event, itemId: string) => {
    try {
      return dal.toggleFavorite(itemId);
    } catch (err: any) {
      console.error('IPC db:toggleFavorite error:', err);
      return false;
    }
  });

  ipcMain.handle('db:updateMetadata', async (_event, itemId: string, metadata: any) => {
    try {
      dal.saveMetadata({
        itemId,
        character: metadata.character,
        sourceOrigin: metadata.sourceOrigin,
        action: metadata.action,
        feeling: metadata.feeling,
        description: metadata.description,
        tags: metadata.tags,
        customAttributes: metadata.customAttributes,
        aiStatus: 'manual_only',
      });
      return true;
    } catch (err: any) {
      console.error('IPC db:updateMetadata error:', err);
      return false;
    }
  });
}
