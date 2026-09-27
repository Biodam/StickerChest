# Task 10: Quick Picker Auto-Paste Integration

**Status**: 🟢 Completed  
**Milestone**: M10  
**Estimated Complexity**: Medium

---

## Objectives
1. Automatically paste the selected sticker into the user's current active input field (chat, document, browser) upon selecting it in the Quick Picker (`Win+/` / `Control+/`).
2. Implement cross-platform native paste keystroke simulation:
   - Windows: VBScript `SendKeys "^v"` executed via `cscript //nologo` with PowerShell fallback.
   - macOS: AppleScript `osascript -e 'tell application "System Events" to keystroke "v" using command down'`.
   - Linux: `xdotool key --clearmodifiers ctrl+v`.
3. Ensure the Quick Picker window hides cleanly and allows a brief 80ms window-manager delay for focus to return to the active application before firing the simulated keystroke.
4. Add user-configurable toggle in Settings: "Quick Picker Auto-Paste: Paste into active app on select".
5. Write unit tests for the paste simulator and auto-paste workflow.

---

## Implementation Checklist
- [x] Create `src/main/services/clipboard/paste-simulator.ts` implementing multiplatform keystroke simulation.
- [x] Extend `src/main/services/clipboard/clipboard-service.ts` with `copyAndPasteSticker` coordinating copy, hide window, focus restore delay, and simulated paste.
- [x] Register `clipboard:copyAndPasteItem` IPC handler in `src/main/ipc/clipboard-handlers.ts`.
- [x] Expose `copyAndPasteItem` across `main.preload.ts` and `picker.preload.ts`.
- [x] Update `src/renderer/picker/App.tsx` `handleSelectItem` to trigger auto-paste workflow.
- [x] Add `autoPasteOnSelect: boolean` to `AppSettings` in `src/types/models.ts` and default to `true` in `settings-store.ts`.
- [x] Add auto-paste configuration toggle in `SettingsModal.tsx`.
- [x] Write unit tests in `tests/unit/paste-simulator.test.ts`.
- [x] Run test suite and production build verification.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M10 status).
3. Run tests: `npm run test && npm run build`.
4. Commit: `git commit -m "feat(picker): implement auto-paste into active input field on select"`.
