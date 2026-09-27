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

  ipcMain.handle('db:getFacets', async () => {
    try {
      return dal.getFacets();
    } catch (err: any) {
      console.error('IPC db:getFacets error:', err);
      return { franchises: [], characters: [], tags: [] };
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
      const userLockedFields: string[] = metadata.userLockedFields || [];
      if (metadata.character !== undefined) userLockedFields.push('character');
      if (metadata.sourceOrigin !== undefined) userLockedFields.push('source_origin');
      if (metadata.action !== undefined) userLockedFields.push('action');
      if (metadata.feeling !== undefined) userLockedFields.push('feeling');
      if (metadata.description !== undefined) userLockedFields.push('description');

      dal.saveMetadata({
        itemId,
        character: metadata.character,
        sourceOrigin: metadata.sourceOrigin,
        action: metadata.action,
        feeling: metadata.feeling,
        description: metadata.description,
        tags: metadata.tags,
        customAttributes: metadata.customAttributes,
        userLockedFields: Array.from(new Set(userLockedFields)),
        isUserEdited: true,
        aiStatus: 'manual_only',
      });
      return true;
    } catch (err: any) {
      console.error('IPC db:updateMetadata error:', err);
      return false;
    }
  });

  // Bulk Handlers
  ipcMain.handle('db:deleteItems', async (_event, itemIds: string[]) => {
    try {
      const count = dal.deleteItems(itemIds);
      return count > 0;
    } catch (err: any) {
      console.error('IPC db:deleteItems error:', err);
      return false;
    }
  });

  ipcMain.handle('db:bulkAddTags', async (_event, itemIds: string[], tags: string[]) => {
    try {
      dal.bulkAddTags(itemIds, tags);
      return true;
    } catch (err: any) {
      console.error('IPC db:bulkAddTags error:', err);
      return false;
    }
  });

  ipcMain.handle('db:bulkRemoveTags', async (_event, itemIds: string[], tags: string[]) => {
    try {
      dal.bulkRemoveTags(itemIds, tags);
      return true;
    } catch (err: any) {
      console.error('IPC db:bulkRemoveTags error:', err);
      return false;
    }
  });

  ipcMain.handle('db:bulkToggleFavorite', async (_event, itemIds: string[], favorite: boolean) => {
    try {
      dal.bulkToggleFavorite(itemIds, favorite);
      return true;
    } catch (err: any) {
      console.error('IPC db:bulkToggleFavorite error:', err);
      return false;
    }
  });

  ipcMain.handle('db:bulkSetCustomAttribute', async (_event, itemIds: string[], key: string, value: string) => {
    try {
      dal.bulkSetCustomAttribute(itemIds, key, value);
      return true;
    } catch (err: any) {
      console.error('IPC db:bulkSetCustomAttribute error:', err);
      return false;
    }
  });
}

