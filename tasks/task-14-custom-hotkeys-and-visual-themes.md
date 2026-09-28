# Task 14: Custom Global Hotkeys & Visual Theme Customizer

**Status**: 🟢 Completed  
**Milestone**: M14  
**Estimated Complexity**: Medium

---

## Objectives
1. Provide personalized accessibility, custom keybinding ergonomics, and customizable aesthetic themes across both the Manager application and Quick Picker companion.
2. **Customizable Global Summon Hotkey**:
   - Enable users to rebind the companion hotkey (default `Super+/` / `Control+/`) in Settings.
   - Interactive key recorder UI component (`HotkeyRecorder.tsx`) that captures keystroke combinations (`Ctrl`, `Alt`, `Shift`, `Meta` + key).
   - Real-time conflict validation against OS-reserved shortcuts with fallback to previous valid keybinding.
   - Dynamic IPC unregister and re-register without application restart.
3. **Multi-Theme Visual Styling Engine**:
   - Provide curated visual themes:
     - `slate_dark`: Default sleek dark charcoal palette.
     - `oled_black`: Pure `#000000` AMOLED high-contrast mode with crisp neon borders.
     - `cyberpunk`: Deep purple/cyan glow accents with futuristic typography.
     - `catppuccin`: Soothing pastel mocha aesthetic.
     - `paper_light`: High-contrast daylight theme for bright office environments.
   - Synchronize active theme instantly across both Manager and Quick Picker windows via IPC (`theme:changed`).
4. **Automated Unit Tests**:
   - Keystroke parsing, electron accelerator formatting, and theme setting persistence.

---

## Implementation Checklist
- [x] Extend `AppSettings` in `src/types/models.ts` with `theme: ThemeId` and `globalShortcut: string`.
- [x] Implement accelerator parser and validation helper in `src/renderer/shared/accelerator-helper.ts`.
- [x] Build interactive `HotkeyRecorder.tsx` component for `SettingsModal.tsx`.
- [x] Add theme token definitions and CSS theme engine in `src/renderer/styles/themes.css`.
- [x] Add theme selector `ThemeSelector.tsx` in `SettingsModal.tsx` and sync `data-theme` attribute across `document.documentElement` and IPC.
- [x] Write unit tests in `tests/unit/theme-and-hotkey.test.ts`.
- [x] Run test suite (`npm run test`) and production build (`npm run build`).

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M14 status).
3. Run tests: `npm run test && npm run build`.
4. Commit: `git commit -m "feat(settings): add custom global hotkey rebinding and visual theme engine"`.
