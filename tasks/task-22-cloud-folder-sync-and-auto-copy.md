# Task 22: Cloud Folder Multi-Device Sync & Auto-Copy

## Overview
Resolved multi-device sticker synchronization issues where items added on one computer were not appearing on another. Enhanced the sidebar "Sync Folder" button to trigger Google Drive synchronization when configured, auto-copied externally added stickers into `<sourceFolder>/sources/`, and ensured bidirectional metadata consistency.

## Background & Problem
1. **Sidebar "Sync Folder" Disconnection**: Clicking "Sync Folder" in the sidebar previously only called `api.scanSourceFolder(false)` (a local disk scan). It never called `api.syncTriggerNow()`, meaning Google Drive was never checked or synced.
2. **Missing Source Copy**: When users added stickers via "Add New Sticker" or drag-and-drop from outside the vault root (e.g. `Downloads/` or `Desktop/`), files were ingested directly from their original location without copying them to `<sourceFolder>/sources/`. Consequently, desktop sync clients (Google Drive for Desktop, OneDrive) had no file changes to propagate to secondary computers.
3. **Public Drive API Key Scope**: Google Cloud API keys are strictly read-only (`GET` calls). Neither machine was uploading locally created stickers to Google Drive via the API key.

## Implementation Details
1. **External Source Auto-Copying (`src/main/ipc/vault-handlers.ts`)**:
   - In `vault:ingestFiles`, when `sourceFolder` is set and an ingested file is outside the vault root, automatically copy it into `<sourceFolder>/sources/<filename>` with collision avoidance (`name_1.ext`).
   - Automatically trigger `exportMetadata(vaultRoot, dal)` whenever new items are ingested so `sticker-chest-metadata.json` remains up to date.
2. **Scan & Metadata Auto-Import (`src/main/services/ingestion/folder-watcher.ts`)**:
   - Updated `scanFolder` to import metadata from `sticker-chest-metadata.json` using `importMetadata(folderPath, dal)` upon scan completion.
3. **Always Run Indexing on Sync (`src/main/services/sync/sync-manager.ts`)**:
   - Updated `syncNow()` so that `scanFolder` and `importMetadata` execute even when zero remote files were downloaded, ensuring newly synced cloud files are registered immediately.
4. **Wired Sidebar "Sync Folder" to Cloud Sync (`src/renderer/manager/App.tsx`)**:
   - Implemented `handleSyncFolder`: when `driveFolderUrl` and `driveApiKey` are configured, triggers `api.syncTriggerNow()`, downloads new assets, and reloads items/facets. If no Drive link is configured, falls back to `api.scanSourceFolder(false)`.
   - Wired `isBusySyncing` and `syncProgress` states to update UI feedback across `Sidebar` and `IngestionBanner`.
5. **UI & Guidance Polish (`src/renderer/manager/components/Sidebar.tsx` & `PublicDriveCard.tsx`)**:
   - Updated button label to show "Syncing..." while active.
   - Clarified read-only nature of Google API keys and documented how to use desktop cloud folders (Google Drive / OneDrive) for two-way automatic multi-device synchronization.
6. **Add Sticker Browser Opener (`src/main/ipc/index.ts`, `src/preload/*.ts`, `src/renderer/manager/App.tsx`)**:
   - Registered secure `app:openExternal` IPC handler to open external `http://` / `https://` URLs in the default browser.
   - Updated `handleAddNew`: when `driveFolderUrl` is configured, clicking "Add New Sticker" opens the Google Drive folder in the browser for direct uploading.
   - Enhanced `Sidebar`, `Header`, and `StickerGrid` buttons with external link visual indicators and descriptive tooltips when Drive sync is active.

## Verification
- Vitest suite: 28 test files passed (146/146 tests).
- Production build: `npm run build` completed with zero warnings and zero TypeScript errors.
