# Task 06: Quick Picker Companion Panel

**Status**: ⚪ Not Started  
**Milestone**: M6  
**Estimated Complexity**: High

---

## Objectives
1. Implement the frameless floating companion modal window (`pickerWindow.ts`) matching the UX of the Windows `Win + .` emoji panel or Raycast/Alfred.
2. Register the global keyboard shortcut (`Alt + Shift + V` on Windows / `Option + Shift + V` on macOS) to toggle picker visibility.
3. Automatically position the picker near the active cursor or display center, auto-focusing the search bar.
4. Auto-hide the picker on `blur` (loss of focus) or `Escape`.
5. Implement tabs:
   - **Recent**: Most recently used stickers (`last_copied_at DESC`).
   - **Favorites**: Favorited stickers (`is_favorite = 1`).
   - **All**: Full searchable library.
6. Support fast keyboard navigation (Arrow keys + Enter) and single-click to copy image to clipboard and hide the modal.

---

## Implementation Checklist
- [ ] Configure Electron `BrowserWindow` with `frame: false`, `alwaysOnTop: true`, `skipTaskbar: true`, `transparent: true`.
- [ ] Implement `globalShortcut.register` in main process with customizable keybind.
- [ ] Implement focus/blur auto-hide listeners.
- [ ] Build the Picker React UI (`src/renderer/picker/`):
  - Top search input with immediate debounced FTS query.
  - Tab switcher (Recent, Favorites, All).
  - Compact grid of stickers with keyboard focus rings.
  - Tier selector toggle (copy as Sticker or Emoji).
- [ ] Implement clipboard copy IPC call and auto-dismiss on selection.
- [ ] Verify instant clipboard pasting in external applications (Discord, Slack, browsers).

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M6 status).
3. Run tests: `npm run test`.
4. Commit: `git commit -m "feat(picker): implement global quick-picker floating modal with recent and favorite tabs"`.
