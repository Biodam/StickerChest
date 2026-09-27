# Task 13: Vault Backup, Restore & Sticker Pack Exporter

**Status**: 🟢 Completed  
**Milestone**: M13  
**Estimated Complexity**: High

---

## Objectives
1. Provide robust library preservation, migration, and interoperability tools to export and restore vaults, and package stickers for third-party platforms.
2. **Full Vault Backup & Migration Archive (`.stickervault`)**:
   - Create single-archive portable backups (`.zip` or `.stickervault`) containing source images, generated variants (`sticker`, `emoji`, `thumb`), the SQLite database snapshot, and an external portable `manifest.json`.
   - Implement an Import & Restore Wizard that validates checksums, unpacks assets into the local vault directory, and merges or restores database records with conflict resolution (skip duplicates, overwrite, merge tags).
3. **Third-Party Sticker Pack Exporters**:
   - **Telegram Sticker Pack**: Export selected stickers conforming to Telegram Bot API specifications (512×512, transparent background, <512KB PNG/WebP).
   - **Discord Pack**: Export formatted Discord Emojis (128×128, <256KB) and Discord Stickers (320×320 PNG/APNG, <500KB).
   - **WhatsApp / Signal Bundle**: Formatted WebP bundles with metadata JSON (<100KB per sticker, tray.png, contents.json).
4. **IPC Progress & Dialogs**:
   - Export/import progress stream (`export:progress`) displayed in a dedicated modal.
   - Native OS save file / open file dialogs.
5. **Automated Unit Tests**:
   - Manifest creation, archive parsing, format compliance validation.

---

## Implementation Checklist
- [x] Create archive packaging service `src/main/services/export/vault-backup.ts` and `src/main/services/export/vault-restore.ts`.
- [x] Create format conversion exporter `src/main/services/export/pack-spec.ts`, `src/main/services/export/pack-converter.ts`, and `src/main/services/export/pack-exporter.ts` (Telegram, Discord, WhatsApp).
- [x] Register IPC handlers (`export:createBackup`, `export:restoreBackup`, `export:exportStickerPack`) in `src/main/ipc/export-handlers.ts`.
- [x] Expose export APIs in `main.preload.ts` and `picker.preload.ts`.
- [x] Create `ExportModal.tsx`, `ImportModal.tsx`, `VaultBackupTab.tsx`, and `StickerPackTab.tsx` in Manager UI.
- [x] Write unit tests in `tests/unit/pack-spec.test.ts`, `tests/unit/pack-converter.test.ts`, and `tests/unit/vault-archive.test.ts`.
- [x] Run test suite (`npm run test`) and production build (`npm run build`).

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M13 status).
3. Run tests: `npm run test && npm run build`.
4. Commit: `git commit -m "feat(export): implement vault backup restore and telegram discord pack exporters"`.
