# Task 21: AVIF Image Format Ingestion & Pipeline Support

## Overview
Add native AVIF (`.avif`) image support across the ingestion pipeline, folder watcher, file scanner, drag-and-drop handler, file picker dialog, public Drive sync, and background removal tools so that AVIF images are discovered, ingested, converted to multi-tier WebP caches, and properly displayed in Sticker Chest.

---

## Key Deliverables & Implementation Details

- [x] **Format Detection & Validation ([`format-detector.ts`](file:///c:/Projects/sticker-database-manager/src/main/services/imaging/format-detector.ts))**:
  - Added `.avif` to `isSupportedImageExtension`.
  - Added `heif: 'image/avif'` to `MIME_MAP` and resolved Sharp metadata reporting `format: 'heif'` for `.avif` files to normalize format to `'avif'` and MIME type to `'image/avif'`.
- [x] **File Scanner & Folder Watcher ([`file-scanner.ts`](file:///c:/Projects/sticker-database-manager/src/main/services/ingestion/file-scanner.ts), [`folder-watcher.ts`](file:///c:/Projects/sticker-database-manager/src/main/services/ingestion/folder-watcher.ts))**:
  - Directory walk and real-time Chokidar file events now pick up `.avif` files automatically via `isSupportedImageExtension`.
- [x] **Import Dialog & IPC ([`index.ts`](file:///c:/Projects/sticker-database-manager/src/main/ipc/index.ts), [`vault-handlers.ts`](file:///c:/Projects/sticker-database-manager/src/main/ipc/vault-handlers.ts))**:
  - Added `avif` to `dialog:selectImages` filter list so the OS file picker displays `.avif` assets.
  - `vault:ingestFiles` now accepts `.avif` files dropped or selected.
- [x] **Public Drive Sync ([`sync-diff.ts`](file:///c:/Projects/sticker-database-manager/src/main/services/sync/sync-diff.ts))**:
  - Added `.avif` to `SUPPORTED_EXTENSIONS` so cloud folder sync downloads remote AVIF images.
- [x] **Imaging Helpers ([`background-paths.ts`](file:///c:/Projects/sticker-database-manager/src/main/services/imaging/background-paths.ts))**:
  - Added `.avif` to `guessMimeType` returning `'image/avif'`.
- [x] **Documentation & Standards**:
  - Updated [`image-standards.md`](file:///c:/Projects/sticker-database-manager/docs/standards/image-standards.md), [`system-overview.md`](file:///c:/Projects/sticker-database-manager/docs/architecture/system-overview.md), and [`public-drive-sync.md`](file:///c:/Projects/sticker-database-manager/docs/standards/public-drive-sync.md).
- [x] **Automated Tests**:
  - Added AVIF extension recognition, metadata detection, directory scanning, and full DAL ingestion tests in [`imaging.test.ts`](file:///c:/Projects/sticker-database-manager/tests/unit/imaging.test.ts).
  - Added AVIF MIME detection test in [`background-paths.test.ts`](file:///c:/Projects/sticker-database-manager/tests/unit/background-paths.test.ts).
  - Added AVIF download calculation test in [`drive-public-sync.test.ts`](file:///c:/Projects/sticker-database-manager/tests/unit/drive-public-sync.test.ts).
