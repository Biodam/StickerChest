# Task 08: Companion Polish & Advanced Usability

**Status**: 🟡 Planned  
**Milestone**: M8  
**Estimated Complexity**: High

---

## Objectives
1. Implement an Electron System Tray icon (`src/main/windows/tray.ts`) so StickerVault can run 24/7 in the background with the Quick Picker global hotkey (`Alt + Shift + V`) always ready.
2. Enable "Close to Tray" behavior for the Main Manager window so closing the window does not terminate the background hotkey listener or periodic cloud sync.
3. Support Drag-and-Drop image ingestion directly into the StickerGrid.
4. Implement Grid Multi-Selection (Ctrl/Cmd-click, Shift-click) with bulk actions:
   - Bulk Tagging (add tags to all selected)
   - Bulk Deletion
   - Bulk Favorite Toggle
   - Bulk AI Re-tag
5. Build Inspector UI controls for:
   - NSFW/SFW blur toggle (blurs image in grid until hovered)
   - 1–5 Star Rating control
   - Custom Key-Value attributes editor (backed by SQLite `custom_attributes` table)
6. Add interactive global hotkey recorder and "Launch at Startup" toggle in Settings (`app.setLoginItemSettings`).

---

## Implementation Checklist
- [ ] Create `src/main/windows/tray.ts` managing the system tray icon, tooltips, click handlers, and context menu.
- [ ] Update `src/main/index.ts` and `mainWindow.ts` with close-to-tray logic (`event.preventDefault(); mainWindow.hide()`).
- [ ] Implement drag-and-drop listener in `StickerGrid.tsx` with drop overlay and IPC handler to copy and ingest files.
- [ ] Add multi-selection state in `App.tsx` and render floating bulk action bar when items are selected.
- [ ] Add NSFW blur styling in `StickerCard.tsx` and toggle in `InspectorDrawer.tsx`.
- [ ] Implement Star Rating (1–5) and Key-Value pairs editor in `InspectorDrawer.tsx` / `MetadataForm.tsx`.
- [ ] Wire `app.setLoginItemSettings` in `src/main/ipc/settings-handlers.ts` and add hotkey rebinding in `SettingsModal.tsx`.
- [ ] Write unit and integration tests verifying multi-select DAL actions and custom attribute queries.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M8 status).
3. Run tests: `npm run test && npm run build`.
4. Commit: `git commit -m "feat(usability): implement system tray companion, drag-drop ingestion, and grid multi-select"`.
