# Task 08: Companion Polish & Advanced Usability

**Status**: 🟢 Completed  
**Milestone**: M8  
**Estimated Complexity**: High

---

## Objectives
1. Implement an Electron System Tray icon (`src/main/windows/tray.ts`) so StickerVault can run 24/7 in the background with the Quick Picker global hotkey (`Alt + Shift + V`) always ready.
2. Enable "Close to Tray" behavior for the Main Manager window so closing the window does not terminate the background hotkey listener or periodic cloud sync.
3. Support Drag-and-Drop image ingestion directly into the StickerGrid.
4. Implement Grid Multi-Selection (Ctrl/Cmd-click, Shift-click, Esc) with bulk actions:
   - Bulk Tagging (add tags to all selected)
   - Bulk Deletion
   - Bulk Favorite Toggle
   - Bulk AI Re-tag
5. Build Inspector UI controls for:
   - NSFW/SFW blur toggle (blurs image in grid with hover-to-reveal)
   - 1–5 Star Rating control
   - Custom Key-Value attributes editor (backed by SQLite `custom_attributes` table)
6. Add interactive global hotkey recorder and "Launch at Startup" toggle in Settings (`app.setLoginItemSettings`).

---

## Implementation Checklist
- [x] Create `src/main/windows/tray.ts` managing the system tray icon, tooltips, click handlers, and context menu.
- [x] Update `src/main/index.ts` and `mainWindow.ts` with close-to-tray logic (`event.preventDefault(); mainWindow.hide()`).
- [x] Implement drag-and-drop listener in `StickerGrid.tsx` with animated drop overlay and IPC handler to copy and ingest files.
- [x] Add multi-selection state via `useSelection.ts` hook and render floating `BulkActionBar.tsx` toolbar when items are selected.
- [x] Add NSFW blur styling in `StickerCard.tsx` and toggle in `CustomAttributesEditor.tsx` / `MetadataForm.tsx`.
- [x] Implement Star Rating (1–5) and Key-Value pairs editor in `CustomAttributesEditor.tsx`.
- [x] Wire bulk database operations in `src/main/services/database/bulk-queries.ts` and `dal.ts`.
- [x] Write unit tests verifying bulk DAL operations (`tests/unit/bulk-operations.test.ts`).

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M8 status).
3. Run tests: `npm run test && npm run build`.
4. Commit: `git commit -m "feat(usability): implement system tray companion, drag-drop ingestion, and grid multi-select"`.
