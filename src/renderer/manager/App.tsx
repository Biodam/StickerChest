import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StickerGrid } from './components/StickerGrid';
import { InspectorDrawer } from './components/InspectorDrawer';
import { SettingsModal } from './components/SettingsModal';
import { IngestionBanner } from './components/IngestionBanner';
import { BulkActionBar } from './components/BulkActionBar';
import { ExportModal } from './components/ExportModal';
import { ImportModal } from './components/ImportModal';
import { AboutModal } from './components/AboutModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { useSelection } from './hooks/useSelection';
import { useGridSize } from './hooks/useGridSize';
import { StickerItem, AppSettings, IngestionProgressEvent, ImageTier, LibraryFacets, SyncProgress } from '../../types/models';

export default function App() {
  const api = window.stickerChest || window.stickerVault;
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'favorites'>('all');
  const [isAnimatedOnly, setIsAnimatedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFranchise, setSelectedFranchise] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [facets, setFacets] = useState<LibraryFacets>({ franchises: [], characters: [], tags: [] });
  const [items, setItems] = useState<StickerItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItem, setSelectedItem] = useState<StickerItem | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState<StickerItem[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [progress, setProgress] = useState<IngestionProgressEvent | null>(null);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [untaggedCount, setUntaggedCount] = useState(0);
  const [removingBackground, setRemovingBackground] = useState(false);
  const [taggingItemId, setTaggingItemId] = useState<string | null>(null);
  const [isBulkAiTagging, setIsBulkAiTagging] = useState(false);

  const { selectedIds, handleSelect, clearSelection } = useSelection();
  const { gridSize, setGridSize } = useGridSize();

  const [settings, setSettings] = useState<AppSettings>({
    sourceFolder: '', geminiApiKey: '', geminiModel: 'gemini-3.8-flash',
    globalShortcut: 'Super+/', preferredCopyTier: 'sticker',
    autoStartAtLogin: false, startMinimized: true, syncIntervalMinutes: 15,
    autoAiTagOnIngest: true, cloudDriveMode: true,
    autoPasteOnSelect: true,
  });

  const loadSettings = async () => {
    if (api?.getSettings) {
      const s = await api.getSettings();
      setSettings(s);
      if (s.theme) {
        document.documentElement.setAttribute('data-theme', s.theme);
      }
    }
  };

  const fetchFacets = useCallback(async () => {
    if (api?.getFacets) setFacets(await api.getFacets());
  }, [api]);

  const fetchUntagged = useCallback(async () => {
    if (api?.getUntaggedCount) setUntaggedCount(await api.getUntaggedCount());
  }, [api]);

  const fetchItems = useCallback(async () => {
    if (!api?.searchItems) return;
    const res = await api.searchItems({
      query: searchQuery, tab: activeTab,
      sourceOrigin: selectedFranchise || undefined, character: selectedCharacter || undefined,
      tag: selectedTag || undefined, isAnimated: isAnimatedOnly ? true : undefined, limit: 100,
    });
    setItems(res.items);
    setTotalItems(res.total);

    setSelectedItem((prev) => {
      if (!prev) return null;
      const updated = res.items.find((i) => i.id === prev.id);
      if (!updated) return prev;
      if (
        prev.updatedAt === updated.updatedAt &&
        prev.metadata?.updatedAt === updated.metadata?.updatedAt &&
        prev.usage.isFavorite === updated.usage.isFavorite &&
        prev.usage.copyCount === updated.usage.copyCount
      ) return prev;
      return updated;
    });
  }, [searchQuery, activeTab, isAnimatedOnly, selectedFranchise, selectedCharacter, selectedTag]);

  useEffect(() => {
    loadSettings();
    fetchFacets();
    fetchUntagged();
  }, [fetchFacets, fetchUntagged]);

  useEffect(() => {
    return api?.onThemeChanged?.((theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      setSettings((prev) => ({ ...prev, theme: theme as any }));
    });
  }, [api]);

  useEffect(() => {
    return api?.onOpenAbout?.(() => {
      setAboutOpen(true);
    });
  }, [api]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    const preventWindowFileDrop = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', preventWindowFileDrop);
    window.addEventListener('drop', preventWindowFileDrop);
    return () => {
      window.removeEventListener('dragover', preventWindowFileDrop);
      window.removeEventListener('drop', preventWindowFileDrop);
    };
  }, []);

  useEffect(() => {
    if (!api?.onIngestionProgress) return;
    return api.onIngestionProgress((event) => {
      setProgress(event);
      if (event.status === 'idle') {
        fetchItems();
        fetchFacets();
        fetchUntagged();
      }
    });
  }, [api, fetchItems, fetchFacets, fetchUntagged]);

  useEffect(() => {
    if (!api?.onSyncProgress) return;
    return api.onSyncProgress((event) => {
      setSyncProgress(event);
      if (event.state === 'synced' || event.state === 'error') {
        fetchItems();
        fetchFacets();
        fetchUntagged();
      }
    });
  }, [api, fetchItems, fetchFacets, fetchUntagged]);

  const handleToggleFavorite = async (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (await api?.toggleFavorite?.(itemId)) {
      setSelectedItem((prev) => (prev?.id === itemId ? { ...prev, usage: { ...prev.usage, isFavorite: !prev.usage.isFavorite } } : prev));
      fetchItems();
    }
  };

  const handleUpdateMetadata = async (itemId: string, meta: any) => {
    if (await api?.updateMetadata?.(itemId, meta)) {
      const fresh = await api?.getItem?.(itemId);
      if (fresh) setSelectedItem(fresh);
      fetchItems();
      fetchFacets();
      fetchUntagged();
    }
  };

  const handleDropFiles = async (filePaths: string[]) => {
    await api?.ingestFiles?.(filePaths);
    fetchItems();
    fetchFacets();
    fetchUntagged();
  };

  const handleAddNew = async () => {
    if (settings.driveFolderUrl) {
      if (api?.openExternalUrl) {
        await api.openExternalUrl(settings.driveFolderUrl);
      }
      return;
    }
    if (!api?.selectImagesDialog) return;
    const filePaths = await api.selectImagesDialog();
    if (filePaths && filePaths.length > 0) {
      await handleDropFiles(filePaths);
    }
  };

  const handleSyncFolder = async () => {
    if (!settings.sourceFolder) {
      setSettingsOpen(true);
      return;
    }
    if (settings.driveFolderUrl && settings.driveApiKey && api?.syncTriggerNow) {
      await api.syncTriggerNow();
    } else if (api?.scanSourceFolder) {
      await api.scanSourceFolder(false);
    }
    fetchItems();
    fetchFacets();
    fetchUntagged();
  };

  const handleBulkFavorite = async (favorite: boolean) => {
    await api?.bulkToggleFavorite?.(Array.from(selectedIds), favorite);
    fetchItems();
  };

  const handleBulkAddTag = async (tag: string) => {
    await api?.bulkAddTags?.(Array.from(selectedIds), [tag]);
    fetchItems();
    fetchFacets();
  };

  const handleBulkAiTag = async () => {
    if (!settings.geminiApiKey) {
      setSettingsOpen(true);
      return;
    }
    setIsBulkAiTagging(true);
    try {
      for (const id of selectedIds) {
        await api?.tagItemWithGemini?.(id);
      }
    } finally {
      setIsBulkAiTagging(false);
      fetchItems();
      fetchFacets();
      fetchUntagged();
    }
  };

  const handleRemoveBackground = async (ids: string[]) => {
    if (!api?.removeBackground || ids.length === 0) return;
    setRemovingBackground(true);
    try {
      const results = await api.removeBackground(ids);
      const failed = results.filter((r) => !r.success);
      if (failed.length > 0) {
        alert(`Background removal failed for ${failed.length} of ${results.length} sticker(s): ${failed[0].error}`);
      }
    } catch (err: any) {
      alert(`Background removal error: ${err.message}`);
    } finally {
      setRemovingBackground(false);
      fetchItems();
      fetchFacets();
      fetchUntagged();
    }
  };

  const handleRequestSingleDelete = useCallback((item: StickerItem) => {
    setItemsToDelete([item]);
    setDeleteModalOpen(true);
  }, []);

  const handleRequestBulkDelete = useCallback(() => {
    const selected = items.filter((it) => selectedIds.has(it.id));
    if (selected.length === 0 && selectedItem) {
      selected.push(selectedItem);
    }
    if (selected.length > 0) {
      setItemsToDelete(selected);
      setDeleteModalOpen(true);
    }
  }, [items, selectedIds, selectedItem]);

  const handleConfirmDelete = async () => {
    if (itemsToDelete.length === 0 || !api?.deleteItems) return;
    setIsDeleting(true);
    try {
      await api.deleteItems(itemsToDelete.map((it) => it.id));
      setDeleteModalOpen(false);
      setItemsToDelete([]);
      clearSelection();
      setSelectedItem(null);
      fetchItems();
      fetchFacets();
      fetchUntagged();
    } catch (err: any) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Keyboard shortcut for deleting selected stickers (Delete / Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable ||
            target.closest?.('input, textarea, [contenteditable="true"]'))
        ) {
          return;
        }

        if (
          deleteModalOpen ||
          settingsOpen ||
          aboutOpen ||
          exportOpen ||
          importOpen
        ) {
          return;
        }

        const selected = items.filter((it) => selectedIds.has(it.id));
        if (selected.length === 0 && selectedItem) {
          selected.push(selectedItem);
        }

        if (selected.length > 0) {
          e.preventDefault();
          setItemsToDelete(selected);
          setDeleteModalOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    items,
    selectedIds,
    selectedItem,
    deleteModalOpen,
    settingsOpen,
    aboutOpen,
    exportOpen,
    importOpen,
  ]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121316] text-[#f1f3f5]">
      <Sidebar
        activeTab={activeTab} isAnimatedOnly={isAnimatedOnly}
        onSelectTab={setActiveTab} onToggleAnimatedOnly={() => setIsAnimatedOnly(!isAnimatedOnly)}
        onSyncFolder={handleSyncFolder}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenAbout={() => setAboutOpen(true)}
        onOpenExport={() => setExportOpen(true)}
        onOpenImport={() => setImportOpen(true)}
        onAddNew={handleAddNew}
        isDriveConfigured={Boolean(settings.driveFolderUrl)}
        isScanning={progress?.status === 'scanning' || progress?.status === 'resizing' || syncProgress?.state === 'syncing'}
        facets={facets} selectedFranchise={selectedFranchise}
        selectedCharacter={selectedCharacter} selectedTag={selectedTag}
        onSelectFranchise={setSelectedFranchise} onSelectCharacter={setSelectedCharacter}
        onSelectTag={setSelectedTag}
        onClearAllFilters={() => { setSelectedFranchise(null); setSelectedCharacter(null); setSelectedTag(null); }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchQuery={searchQuery} totalItems={totalItems}
          onSearchChange={setSearchQuery} onClearSearch={() => setSearchQuery('')}
          selectedFranchise={selectedFranchise} selectedCharacter={selectedCharacter} selectedTag={selectedTag}
          onClearFranchise={() => setSelectedFranchise(null)} onClearCharacter={() => setSelectedCharacter(null)}
          onClearTag={() => setSelectedTag(null)} modelName={settings.geminiModel}
          untaggedCount={untaggedCount}
          onBatchAiTag={async () => settings.geminiApiKey ? api?.batchTagUntagged?.() : setSettingsOpen(true)}
          isTagging={progress?.status === 'tagging'}
          gridSize={gridSize}
          onGridSizeChange={setGridSize}
          onAddNew={handleAddNew}
          isDriveConfigured={Boolean(settings.driveFolderUrl)}
        />

        <IngestionBanner
          progress={progress}
          syncProgress={syncProgress}
          onDismiss={() => { setProgress(null); setSyncProgress(null); }}
        />

        <div className="flex-1 flex overflow-hidden relative">
          <StickerGrid
            items={items}
            selectedItem={selectedItem}
            selectedItemIds={selectedIds}
            searchQuery={searchQuery}
            gridSize={gridSize}
            onSelectItem={(it, e) => handleSelect(it, items, e, setSelectedItem)}
            onToggleFavorite={handleToggleFavorite}
            onOpenSettings={() => setSettingsOpen(true)}
            onDropFiles={handleDropFiles}
            onAddNew={handleAddNew}
            onDeleteItem={handleRequestSingleDelete}
            isDriveConfigured={Boolean(settings.driveFolderUrl)}
          />

          {selectedItem && selectedIds.size <= 1 && (
            <InspectorDrawer
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onToggleFavorite={() => handleToggleFavorite(selectedItem.id)}
              isTagging={taggingItemId === selectedItem.id}
              onTagWithGemini={async (id) => {
                if (!settings.geminiApiKey) {
                  setSettingsOpen(true);
                  return;
                }
                setTaggingItemId(id);
                try {
                  await api?.tagItemWithGemini?.(id);
                  const fresh = await api?.getItem?.(id);
                  if (fresh) setSelectedItem(fresh);
                  fetchItems();
                  fetchFacets();
                  fetchUntagged();
                } finally {
                  setTaggingItemId(null);
                }
              }}
              onRemoveBackground={(id) => handleRemoveBackground([id])}
              removingBackground={removingBackground}
              onCopyItem={(id, tier) => api?.copyItemToClipboard?.(id, tier)}
              onUpdateMetadata={handleUpdateMetadata}
              onDelete={handleRequestSingleDelete}
            />
          )}

          <BulkActionBar
            selectedCount={selectedIds.size}
            onClearSelection={clearSelection}
            onBulkFavorite={handleBulkFavorite}
            onBulkAddTag={handleBulkAddTag}
            onBulkAiTag={handleBulkAiTag}
            isAiTagging={isBulkAiTagging}
            onBulkRemoveBackground={() => handleRemoveBackground(Array.from(selectedIds))}
            removingBackground={removingBackground}
            onBulkExport={() => setExportOpen(true)}
            onBulkDelete={handleRequestBulkDelete}
          />
        </div>
      </div>

      <ExportModal
        isOpen={exportOpen} onClose={() => setExportOpen(false)}
        totalStickers={totalItems} selectedItemIds={Array.from(selectedIds)}
      />

      <ImportModal
        isOpen={importOpen} onClose={() => setImportOpen(false)}
        onRestoreComplete={() => { fetchItems(); fetchFacets(); fetchUntagged(); }}
      />

      <SettingsModal
        settings={settings} isOpen={settingsOpen} onClose={() => setSettingsOpen(false)}
        onSaveSettings={async (up) => {
          setSettings((prev) => ({ ...prev, ...up }));
          await api?.saveSettings?.(up);
          if (up.sourceFolder && up.sourceFolder !== settings.sourceFolder) api?.scanSourceFolder?.(false);
        }}
        onSelectFolder={async () => api?.selectFolderDialog?.() || null}
        onTestKey={async (k, m) => api?.testGeminiKey?.(k, m) || { valid: false }}
      />

      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        items={itemsToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}
