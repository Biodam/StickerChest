import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StickerGrid } from './components/StickerGrid';
import { InspectorDrawer } from './components/InspectorDrawer';
import { SettingsModal } from './components/SettingsModal';
import { IngestionBanner } from './components/IngestionBanner';
import { StickerItem, AppSettings, IngestionProgressEvent, ImageTier, LibraryFacets } from '../../types/models';

export default function App() {
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
  const [progress, setProgress] = useState<IngestionProgressEvent | null>(null);

  const [settings, setSettings] = useState<AppSettings>({
    sourceFolder: '', geminiApiKey: '', geminiModel: 'gemini-3.8-flash',
    globalShortcut: 'Alt+Shift+V', preferredCopyTier: 'sticker',
    autoStartAtLogin: false, syncIntervalMinutes: 15,
    autoAiTagOnIngest: true, cloudDriveMode: true,
  });

  const loadSettings = async () => {
    if (window.stickerVault?.getSettings) {
      const data = await window.stickerVault.getSettings();
      setSettings(data);
    }
  };

  const fetchFacets = useCallback(async () => {
    if (!window.stickerVault?.getFacets) return;
    try {
      const data = await window.stickerVault.getFacets();
      setFacets(data);
    } catch (err) {
      console.error('Failed to load facets:', err);
    }
  }, []);

  const fetchItems = useCallback(async () => {
    if (!window.stickerVault?.searchItems) return;
    const res = await window.stickerVault.searchItems({
      query: searchQuery,
      tab: activeTab,
      sourceOrigin: selectedFranchise || undefined,
      character: selectedCharacter || undefined,
      tag: selectedTag || undefined,
      isAnimated: isAnimatedOnly ? true : undefined,
      limit: 100,
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
      ) {
        return prev;
      }
      return updated;
    });
  }, [searchQuery, activeTab, isAnimatedOnly, selectedFranchise, selectedCharacter, selectedTag]);

  useEffect(() => {
    loadSettings();
    fetchFacets();
  }, [fetchFacets]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (!window.stickerVault?.onIngestionProgress) return;
    const unsubscribe = window.stickerVault.onIngestionProgress((event) => {
      setProgress(event);
      if (event.status === 'idle') {
        fetchItems();
        fetchFacets();
      }
    });
    return unsubscribe;
  }, [fetchItems, fetchFacets]);

  const handleToggleFavorite = async (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (await window.stickerVault?.toggleFavorite?.(itemId)) {
      setSelectedItem((prev) => (prev?.id === itemId ? { ...prev, usage: { ...prev.usage, isFavorite: !prev.usage.isFavorite } } : prev));
      fetchItems();
    }
  };

  const handleUpdateMetadata = async (itemId: string, meta: any) => {
    if (await window.stickerVault?.updateMetadata?.(itemId, meta)) {
      const fresh = await window.stickerVault?.getItem?.(itemId);
      if (fresh) setSelectedItem(fresh);
      fetchItems();
      fetchFacets();
    }
  };

  const handleTagWithGemini = async (itemId: string) => {
    if (await window.stickerVault?.tagItemWithGemini?.(itemId)) {
      const fresh = await window.stickerVault?.getItem?.(itemId);
      if (fresh) setSelectedItem(fresh);
      fetchItems();
      fetchFacets();
    }
  };

  const handleCopyItem = (itemId: string, tier: ImageTier) => {
    window.stickerVault?.copyItemToClipboard?.(itemId, tier);
  };

  const handleSyncFolder = async () => {
    if (!settings.sourceFolder) return setSettingsOpen(true);
    await window.stickerVault?.scanSourceFolder?.(false);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#121316] text-[#f1f3f5]">
      <Sidebar
        activeTab={activeTab}
        isAnimatedOnly={isAnimatedOnly}
        onSelectTab={setActiveTab}
        onToggleAnimatedOnly={() => setIsAnimatedOnly(!isAnimatedOnly)}
        onSyncFolder={handleSyncFolder}
        onOpenSettings={() => setSettingsOpen(true)}
        isScanning={progress?.status === 'scanning' || progress?.status === 'resizing'}
        facets={facets}
        selectedFranchise={selectedFranchise}
        selectedCharacter={selectedCharacter}
        selectedTag={selectedTag}
        onSelectFranchise={setSelectedFranchise}
        onSelectCharacter={setSelectedCharacter}
        onSelectTag={setSelectedTag}
        onClearAllFilters={() => {
          setSelectedFranchise(null);
          setSelectedCharacter(null);
          setSelectedTag(null);
        }}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchQuery={searchQuery}
          totalItems={totalItems}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
          selectedFranchise={selectedFranchise}
          selectedCharacter={selectedCharacter}
          selectedTag={selectedTag}
          onClearFranchise={() => setSelectedFranchise(null)}
          onClearCharacter={() => setSelectedCharacter(null)}
          onClearTag={() => setSelectedTag(null)}
          modelName={settings.geminiModel}
        />

        <IngestionBanner progress={progress} onDismiss={() => setProgress(null)} />

        <div className="flex-1 flex overflow-hidden">
          <StickerGrid
            items={items}
            selectedItem={selectedItem}
            searchQuery={searchQuery}
            onSelectItem={setSelectedItem}
            onToggleFavorite={handleToggleFavorite}
            onOpenSettings={() => setSettingsOpen(true)}
          />

          {selectedItem && (
            <InspectorDrawer
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onToggleFavorite={() => handleToggleFavorite(selectedItem.id)}
              onTagWithGemini={handleTagWithGemini}
              onCopyItem={handleCopyItem}
              onUpdateMetadata={handleUpdateMetadata}
            />
          )}
        </div>
      </div>

      <SettingsModal
        settings={settings}
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaveSettings={async (up) => {
          setSettings((prev) => ({ ...prev, ...up }));
          await window.stickerVault?.saveSettings?.(up);
          if (up.sourceFolder && up.sourceFolder !== settings.sourceFolder) window.stickerVault?.scanSourceFolder?.(false);
        }}
        onSelectFolder={async () => window.stickerVault?.selectFolderDialog?.() || null}
        onTestKey={async (k, m) => window.stickerVault?.testGeminiKey?.(k, m) || { valid: false }}
      />
    </div>
  );
}
