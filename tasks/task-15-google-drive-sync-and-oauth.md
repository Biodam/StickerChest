# Task 15: Google Drive Cloud Sync & OAuth Integration

**Status**: ⏳ Planned  
**Milestone**: M15  
**Estimated Complexity**: High

---

## 1. High-Level Objectives

1. **Native Google OAuth 2.0 Integration**:
   - Authenticate users directly from the desktop application without relying on external folder sync software (e.g. Google Drive Desktop).
   - Secure desktop flow using a local loopback server (`http://127.0.0.1:<port>`), PKCE (Proof Key for Code Exchange), and the system default browser (`shell.openExternal`).
   - Store OAuth tokens securely using Electron's native `safeStorage` API (backed by Windows DPAPI / macOS Keychain).

2. **Isolated AppData Storage (`drive.appdata`)**:
   - Target the private Google Drive Application Data folder (`https://www.googleapis.com/auth/drive.appdata`).
   - Keep user libraries completely isolated from their general Google Drive files, preventing accidental user deletion and avoiding intrusive Google OAuth scopes.

3. **Two-Tier Synchronization Pipeline**:
   - **Content-Addressable Asset Sync**: Upload and download immutable sticker variants (`sticker`, `emoji`, `thumb`) keyed by their SHA-256 hashes. Verify hash existence in the cloud before uploading to achieve zero duplicates and idempotency.
   - **SQLite Metadata Sync**: Perform consistent SQLite backups using SQLite's online backup API to prevent WAL/file-lock corruption, upload timestamped cloud snapshots with checksums, and resolve conflicts safely.

4. **IPC Telemetry & Settings UI**:
   - Stream live sync status (`idle`, `authenticating`, `syncing`, `downloading`, `error`, `synced`) and file transfer progress to the Manager UI.
   - Add a dedicated **Google Drive Cloud Sync** section in `SettingsModal.tsx` with one-click connect/disconnect, last synced timestamp, and manual sync triggers.

---

## 2. Architecture & File Decomposition

Adhering to the small-file principle (< 200 lines per file), the sync architecture is divided into dedicated sub-modules:

```
src/main/services/sync/
├── oauth-loopback.ts       # Ephemeral 127.0.0.1 HTTP listener for OAuth redirect & PKCE verification
├── token-vault.ts          # Encrypted token storage & auto-refresh via Electron safeStorage
├── gdrive-client.ts        # Typed Google Drive REST API v3 client (appDataFolder scope)
├── image-sync-worker.ts    # Content-addressable SHA-256 image upload/download worker
├── db-sync-coordinator.ts  # SQLite backup snapshotting, upload/download, and conflict safety
└── sync-manager.ts         # High-level orchestrator coordinating auth, images, DB, and IPC status
```

### Module Responsibilities

| File | Purpose | Key Responsibilities |
|---|---|---|
| `oauth-loopback.ts` | Auth Flow | Starts ephemeral HTTP server on `127.0.0.1`, generates PKCE `code_verifier` & `code_challenge`, handles Google redirect callback, exchanges authorization code for tokens. |
| `token-vault.ts` | Credential Store | Encrypts/decrypts access & refresh tokens using Electron `safeStorage`. Checks expiry and handles silent token refresh against Google's token endpoint. |
| `gdrive-client.ts` | Cloud API | Minimal REST client for Google Drive v3 (`drive.appdata`). Methods: `listFiles()`, `uploadFile()`, `downloadFile()`, `deleteFile()`, `getStorageQuota()`. |
| `image-sync-worker.ts` | Image Transfer | Compares local storage hashes with remote `images/` directory. Uploads missing variants with retry/exponential backoff; downloads missing remote images. |
| `db-sync-coordinator.ts` | Database Sync | Triggers safe online SQLite snapshot to temp file (`VACUUM INTO` or backup API). Compares remote `manifest.json` timestamp and checksum before applying or pushing. |
| `sync-manager.ts` | Orchestrator | Coordinates the entire sync routine: checks token -> syncs images -> syncs database -> emits progress events -> updates local settings. |

---

## 3. Data Models & API Contracts

### Sync Status Contract (`src/types/models.ts`)
```typescript
export type SyncState = 'idle' | 'authenticating' | 'syncing' | 'downloading' | 'error' | 'synced';

export interface SyncProgress {
  state: SyncState;
  currentStep?: string;
  filesTransferred: number;
  totalFiles: number;
  bytesTransferred: number;
  totalBytes: number;
  lastSyncTimestamp: number | null;
  errorMessage?: string;
}

export interface GoogleDriveAccountInfo {
  connected: boolean;
  email?: string;
  displayName?: string;
  storageUsedBytes?: number;
  storageTotalBytes?: number;
  lastSyncTimestamp?: number | null;
}
```

### IPC Channels
- `sync:getAccountInfo`: Returns current connection status, user profile, and quota.
- `sync:connectGoogleDrive`: Initiates OAuth PKCE loopback login flow.
- `sync:disconnectGoogleDrive`: Revokes tokens and clears encrypted credentials.
- `sync:triggerSync`: Starts an on-demand bidirectional synchronization run.
- `sync:onProgress` (Event stream): Emits `SyncProgress` updates to renderers.

---

## 4. Implementation Checklist

### Phase 1: Authentication & Token Security
- [ ] Implement `src/main/services/sync/oauth-loopback.ts` with PKCE generation and ephemeral HTTP server.
- [ ] Implement `src/main/services/sync/token-vault.ts` using `electron.safeStorage` with refresh token rotation.
- [ ] Register IPC handlers for login and logout in `src/main/ipc/sync-handlers.ts`.
- [ ] Test loopback server lifecycle, timeout handling, and port collision resilience.

### Phase 2: Google Drive API Client & AppData Storage
- [ ] Implement `src/main/services/sync/gdrive-client.ts` implementing `appDataFolder` operations:
  - Multi-part resumable uploads for large assets.
  - Querying files by name / property within the private app container.
  - Fetching user profile information (email, storage quota).
- [ ] Write unit tests with mocked Google Drive endpoints in `tests/unit/gdrive-client.test.ts`.

### Phase 3: Content-Addressable Asset Synchronization
- [ ] Implement `src/main/services/sync/image-sync-worker.ts`:
  - Query remote file list in `images/` subfolder of `appDataFolder`.
  - Diff against local files in `storage/` directory by SHA-256.
  - Upload missing local files; download missing remote files.
  - Implement concurrency limiting (e.g. 3 concurrent uploads) and retry with exponential backoff.

### Phase 4: Database Snapshotting & Conflict Resolution
- [ ] Implement `src/main/services/sync/db-sync-coordinator.ts`:
  - Export consistent SQLite snapshot using `VACUUM INTO` or SQLite backup API into a temporary directory.
  - Generate metadata `manifest.json` with item count, schema version, device ID, and timestamp.
  - Safe restore routine: on newer remote snapshot, verify checksum, close active DB connections, replace `stickers.db`, and reinitialize DAL.

### Phase 5: UI & Settings Integration
- [ ] Create `GoogleDriveSyncSection.tsx` in `src/renderer/manager/components/`.
- [ ] Add connection status badge, user profile, quota progress bar, and "Sync Now" button.
- [ ] Display live sync progress (transferring X of Y items) in the Manager footer/header.
- [ ] Add settings toggles: "Sync automatically on startup / close" and "Sync on new sticker ingest".

### Phase 6: Automated Testing & Verification
- [ ] Unit tests for OAuth loopback flow and PKCE verification (`tests/unit/oauth-loopback.test.ts`).
- [ ] Unit tests for safe token encryption/decryption fallback (`tests/unit/token-vault.test.ts`).
- [ ] Integration tests for image diffing and snapshot synchronization (`tests/unit/gdrive-sync.test.ts`).
- [ ] Run full test suite (`npm run test`) and verification build (`npm run build`).

---

## 5. Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M15 status).
3. Run tests: `npm run test && npm run build`.
4. Commit: `git commit -m "feat(sync): implement google drive oauth and direct appdata cloud sync"`.
