import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { InspectorDrawer } from '../../src/renderer/manager/components/InspectorDrawer';
import { BulkActionBar } from '../../src/renderer/manager/components/BulkActionBar';
import { StickerItem } from '../../src/types/models';

function createMockItem(aiStatus?: string): StickerItem {
  return {
    id: 'test-sticker-1',
    sha256Hash: 'hash123',
    filename: 'test.png',
    originalPath: 'C:/stickers/test.png',
    ext: '.png',
    mimeType: 'image/png',
    width: 256,
    height: 256,
    fileSizeBytes: 1024,
    isAnimated: false,
    frameCount: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    variants: { raw: null, sticker: null, emoji: null, thumb: null },
    metadata: aiStatus
      ? {
          id: 'meta-1',
          itemId: 'test-sticker-1',
          character: 'Anya',
          sourceOrigin: 'Spy x Family',
          action: 'smile',
          feeling: 'happy',
          description: 'Anya smiling',
          aiModel: 'gemini-3.8-flash',
          aiStatus: aiStatus as any,
          userLockedFields: [],
          isUserEdited: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      : null,
    tags: ['cute'],
    userTags: [],
    customAttributes: {},
    usage: {
      itemId: 'test-sticker-1',
      isFavorite: false,
      copyCount: 0,
      lastCopiedAt: null,
    },
  };
}

describe('AI Tag Loading Feedback', () => {
  it('renders idle AI Tag button in InspectorDrawer when not tagging', () => {
    const item = createMockItem('completed');
    const html = renderToString(
      React.createElement(InspectorDrawer, {
        item,
        onClose: vi.fn(),
        onToggleFavorite: vi.fn(),
        onTagWithGemini: vi.fn(),
        isTagging: false,
        onRemoveBackground: vi.fn(),
        removingBackground: false,
        onCopyItem: vi.fn(),
        onUpdateMetadata: vi.fn(),
      })
    );

    expect(html).toContain('AI Tag');
    expect(html).toContain('AI Tagged');
    expect(html).not.toContain('Tagging...');
  });

  it('renders loading feedback in InspectorDrawer when isTagging is true', () => {
    const item = createMockItem('completed');
    const html = renderToString(
      React.createElement(InspectorDrawer, {
        item,
        onClose: vi.fn(),
        onToggleFavorite: vi.fn(),
        onTagWithGemini: vi.fn(),
        isTagging: true,
        onRemoveBackground: vi.fn(),
        removingBackground: false,
        onCopyItem: vi.fn(),
        onUpdateMetadata: vi.fn(),
      })
    );

    expect(html).toContain('Tagging...');
    expect(html).toContain('disabled=""');
  });

  it('renders loading feedback in InspectorDrawer when item aiStatus is processing', () => {
    const item = createMockItem('processing');
    const html = renderToString(
      React.createElement(InspectorDrawer, {
        item,
        onClose: vi.fn(),
        onToggleFavorite: vi.fn(),
        onTagWithGemini: vi.fn(),
        isTagging: false,
        onRemoveBackground: vi.fn(),
        removingBackground: false,
        onCopyItem: vi.fn(),
        onUpdateMetadata: vi.fn(),
      })
    );

    expect(html).toContain('Tagging...');
    expect(html).toContain('disabled=""');
  });

  it('renders idle AI Tag button in BulkActionBar when isAiTagging is false', () => {
    const html = renderToString(
      React.createElement(BulkActionBar, {
        selectedCount: 3,
        onClearSelection: vi.fn(),
        onBulkFavorite: vi.fn(),
        onBulkAddTag: vi.fn(),
        onBulkAiTag: vi.fn(),
        isAiTagging: false,
        onBulkRemoveBackground: vi.fn(),
        removingBackground: false,
        onBulkDelete: vi.fn(),
      })
    );

    expect(html).toContain('AI Tag');
    expect(html).not.toContain('Tagging...');
  });

  it('renders loading feedback in BulkActionBar when isAiTagging is true', () => {
    const html = renderToString(
      React.createElement(BulkActionBar, {
        selectedCount: 3,
        onClearSelection: vi.fn(),
        onBulkFavorite: vi.fn(),
        onBulkAddTag: vi.fn(),
        onBulkAiTag: vi.fn(),
        isAiTagging: true,
        onBulkRemoveBackground: vi.fn(),
        removingBackground: false,
        onBulkDelete: vi.fn(),
      })
    );

    expect(html).toContain('Tagging...');
    expect(html).toContain('disabled=""');
  });
});
