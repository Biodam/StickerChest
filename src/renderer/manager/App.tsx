import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StickerGrid } from './components/StickerGrid';
import { InspectorDrawer } from './components/InspectorDrawer';
import { SettingsModal } from './components/SettingsModal';
import { IngestionBanner } from './components/IngestionBanner';
import { StickerItem, AppSettings, IngestionProgressEvent, ImageTier } from '../../types/models';

export default function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'recent' | 'favorites'>('all');
  const [isAnimatedOnly, setIsAnimatedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<StickerItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItem, setSelectedItem] = useState<StickerItem | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [progress, setProgress] = useState<IngestionProgressEvent | null>(null);

  const [settings, setSettings] = useState<AppSettings>({
    sourceFolder: '',
    geminiApiKey: '',
    geminiModel: 'gemini-2.5-flash',
    globalShortcut: 'Alt+Shift+V',
    preferredCopyTier: 'sticker',
    autoStartAtLogin: false,
  });

  const loadSettings = async () => {
    if (window.stickerVault?.getSettings) {
      const data = await window.stickerVault.getSettings();
      setSettings(data);
    }
  };

  const fetchItems = useCallback(async () => {
    if (!window.stickerVault?.searchItems) return;
    const res = await window.stickerVault.searchItems({
      query: searchQuery,
      tab: activeTab,
      isAnimated: isAnimatedOnly ? true : undefined,
      limit: 100,
    });
    setItems(res.items);
    setTotalItems(res.total);

    // Refresh selected item if it was updated
    if (selectedItem) {
      const updated = res.items.find((i) => i.id === selectedItem.id);
      if (updated) setSelectedItem(updated);
    }
  }, [searchQuery, activeTab, isAnimatedOnly, selectedItem]);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [searchQuery, activeTab, isAnimatedOnly]);

  useEffect(() => {
    if (!window.stickerVault?.onIngestionProgress) return;
    const unsubscribe = window.stickerVault.onIngestionProgress((event) => {
      setProgress(event);
      if (event.status === 'idle') {
        fetchItems();
      }
    });
    return unsubscribe;
  }, [fetchItems]);

  const handleToggleFavorite = async (itemId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.stickerVault?.toggleFavorite) return;
    await window.stickerVault.toggleFavorite(itemId);
    fetchItems();
  };

  const handleUpdateMetadata = async (itemId: string, meta: any) => {
    if (!window.stickerVault?.updateMetadata) return;
    await window.stickerVault.updateMetadata(itemId, meta);
    fetchItems();
  };

  const handleTagWithGemini = async (itemId: string) => {
    if (!window.stickerVault?.tagItemWithGemini) return;
    await window.stickerVault.tagItemWithGemini(itemId);
    fetchItems();
  };

  const handleCopyItem = async (itemId: string, tier: ImageTier) => {
    if (!window.stickerVault?.copyItemToClipboard) return;
    await window.stickerVault.copyItemToClipboard(itemId, tier);
  };

  const handleSyncFolder = async () => {
    if (!settings.sourceFolder) {
      setSettingsOpen(true);
      return;
    }
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
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          searchQuery={searchQuery}
          totalItems={totalItems}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery('')}
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
        onSaveSettings={async (updated) => {
          setSettings((prev) => ({ ...prev, ...updated }));
          await window.stickerVault?.saveSettings?.(updated);
          if (updated.sourceFolder && updated.sourceFolder !== settings.sourceFolder) {
            window.stickerVault?.scanSourceFolder?.(false);
          }
        }}
        onSelectFolder={async () => window.stickerVault?.selectFolderDialog?.() || null}
        onTestKey={async (key) => window.stickerVault?.testGeminiKey?.(key) || { valid: false }}
      />
    </div>
  );
}
