# Public Drive Folder Sync

Replaces the former Google OAuth sync. The user pastes a public ("Anyone with the link") Google Drive folder link plus their own Google API key (Drive API enabled). No login, no OAuth client, no tokens.

## Behavior
- **One-way**: Drive -> local `sourceFolder`. Writing to Drive requires OAuth, so local additions are not uploaded.
- Lists the folder via Drive API v3 `files.list` (`key=`), downloads new/changed `.png/.jpg/.jpeg/.webp/.gif/.avif` files (`alt=media`), then triggers the normal ingestion scan.
- State is kept in `<sourceFolder>/.drive-sync-state.json` (filename -> md5). Files deleted locally are re-downloaded.
- Auto-sync runs 5s after startup and every `syncIntervalMinutes` when `driveAutoSync` is on.
- Optional `sticker-chest-metadata.json` (tags, character, description, favorites keyed by SHA-256) is imported after sync; items edited locally are not overwritten. "Export metadata" writes this file into the source folder for manual upload to Drive.

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
