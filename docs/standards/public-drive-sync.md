# Public Drive Folder Sync

Replaces the former Google OAuth sync. The user pastes a public ("Anyone with the link") Google Drive folder link plus their own Google API key (Drive API enabled). No login, no OAuth client, no tokens.

## Behavior
- **One-way**: Drive -> local `sourceFolder`. Writing to Drive requires OAuth, so local additions are not uploaded.
- Lists the folder via Drive API v3 `files.list` (`key=`), downloads new/changed `.png/.jpg/.jpeg/.webp/.gif/.avif` files (`alt=media`), then triggers the normal ingestion scan.
- State is kept in `<sourceFolder>/.drive-sync-state.json` (filename -> md5). Files deleted locally are re-downloaded.
- Auto-sync runs 5s after startup and every `syncIntervalMinutes` when `driveAutoSync` is on.
- The sidebar "Sync Folder" button runs `syncTriggerNow()` if Drive credentials are set (downloading remote assets and importing metadata), or `scanSourceFolder()` if no Drive link is configured.
- Optional `sticker-chest-metadata.json` (tags, character, description, favorites keyed by SHA-256) is imported after sync and exported automatically upon file ingestion; items edited locally are not overwritten. "Export metadata" also writes this file into the source folder for manual upload to Drive.

## Two-Way Multi-Computer Sync (Recommended Setup)
Because Google API keys are strictly read-only, two-way synchronization between multiple computers is achieved by setting `sourceFolder` on each computer to a folder managed by a desktop cloud provider (Google Drive for Desktop, OneDrive, Dropbox, etc.):
1. Point `sourceFolder` on all machines to the same cloud folder (e.g., `C:\Users\<user>\Google Drive\Stickers` or `OneDrive\Imagens\StickerChest`).
2. When a sticker is added via "Add New Sticker" or drag-and-drop from outside the vault, Sticker Chest automatically copies the source file into `<sourceFolder>/sources/<filename>` and updates `sticker-chest-metadata.json`.
3. The desktop cloud client synchronizes the file and metadata across machines.
4. The other machine's folder watcher (or clicking "Sync Folder") detects the new image and tags, automatically ingesting and indexing it.

## Settings
`driveFolderUrl`, `driveApiKey`, `driveAutoSync` (see [models.ts](file:///c:/Projects/sticker-database-manager/src/types/models.ts)).

## Code
- [folder-link-parser.ts](file:///c:/Projects/sticker-database-manager/src/main/services/sync/folder-link-parser.ts)
- [drive-public-client.ts](file:///c:/Projects/sticker-database-manager/src/main/services/sync/drive-public-client.ts)
- [sync-diff.ts](file:///c:/Projects/sticker-database-manager/src/main/services/sync/sync-diff.ts)
- [metadata-sync.ts](file:///c:/Projects/sticker-database-manager/src/main/services/sync/metadata-sync.ts)
- [sync-manager.ts](file:///c:/Projects/sticker-database-manager/src/main/services/sync/sync-manager.ts)
- [PublicDriveCard.tsx](file:///c:/Projects/sticker-database-manager/src/renderer/manager/components/settings/PublicDriveCard.tsx)

## Getting an API key
Google Cloud Console -> create project -> enable *Google Drive API* -> Credentials -> *Create API key* (restrict it to the Drive API). No consent screen is needed.
