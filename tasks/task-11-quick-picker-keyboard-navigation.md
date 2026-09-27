# Task 11: Quick Picker Full Keyboard Interaction

**Status**: 🟢 Completed  
**Milestone**: M11  
**Estimated Complexity**: Medium

---

## Objectives
1. Provide a fluid, 100% mouse-free keyboard navigation experience within the Quick Picker companion panel (`Win+/` / `Control+/`), matching the ergonomics of Spotlight, Raycast, and Alfred.
2. **Window-Level Keydown Capture & Input Routing**:
   - Listen for keyboard events at the window level so shortcuts function consistently regardless of whether the search input, tabs, or grid currently have DOM focus.
   - Route alphanumeric typing into the search input automatically when navigating the grid.
3. **2D Grid Navigation & Auto-Scroll**:
   - Fluid 4-directional arrow key navigation (`ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`).
   - Boundary navigation (`Home` to jump to first item, `End` to jump to last item, `PageUp`/`PageDown` to jump by 4 rows).
   - Auto-scroll the active sticker into view (`scrollIntoView({ block: 'nearest' })`) so keyboard-selected items never move offscreen.
4. **Tab Switching Shortcuts**:
   - Quick tab switching via `Ctrl+1` (Recent), `Ctrl+2` (Favorites), and `Ctrl+3` (All) or `Cmd+1/2/3` on macOS.
   - `Tab` / `Shift+Tab` cycling across controls.
5. **Tier Toggle & Action Overrides**:
   - `Ctrl+T` / `Cmd+T`: Toggle copy resolution between high-res `sticker` (512px) and `emoji` (128px).
   - `Enter`: Execute primary action (auto-paste into active input field or copy to clipboard based on user settings).
   - `Shift+Enter`: Inverted action (copy-only without auto-pasting, or vice versa).
   - `Ctrl+S` / `Cmd+S`: Toggle favorite/star status on the currently selected sticker.
6. **Two-Stage Escape Key**:
   - If the search query is non-empty, first `Escape` clears the query and restores full view.
   - If the search query is empty, `Escape` hides the picker window immediately.
7. **Visual Keyboard Legend in Footer**:
   - Redesign `PickerFooter.tsx` with compact, readable shortcut chips (`↑↓←→` Navigate, `↵` Paste, `⇧↵` Copy, `^123` Tabs, `^T` Tier, `Esc` Close).
8. **Automated Unit Tests**:
   - Test keyboard navigation reducer/handler and bounds checking.

---

## Implementation Checklist
- [x] Create keyboard navigation helper `src/renderer/picker/keyboard-navigation.ts` and hook `src/renderer/picker/hooks/usePickerKeyboard.ts` encapsulating grid navigation, shortcuts, boundary limits, and action dispatching.
- [x] Implement DOM auto-scroll into view for selected sticker in `src/renderer/picker/components/PickerGrid.tsx`.
- [x] Implement two-stage `Escape` handling (clear search vs hide picker).
- [x] Implement `Ctrl+1`, `Ctrl+2`, `Ctrl+3` tab switching and `Ctrl+T` tier toggling.
- [x] Implement `Enter` (auto-paste) vs `Shift+Enter` (copy-only) action dispatching.
- [x] Implement `Ctrl+S` favorite toggling via IPC for the selected sticker.
- [x] Refactor `src/renderer/picker/App.tsx` to integrate window-level keyboard listener.
- [x] Update `src/renderer/picker/components/PickerFooter.tsx` with keyboard shortcut badge legend.
- [x] Add unit tests in `tests/unit/picker-keyboard.test.ts` (15 passing tests).
- [x] Run test suite (`npm run test`: 66/66 passing) and production build (`npm run build`).

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M11 status).
3. Run tests: `npm run test && npm run build`.
4. Commit: `git commit -m "feat(picker): implement full keyboard navigation and shortcuts in quick selector"`.

