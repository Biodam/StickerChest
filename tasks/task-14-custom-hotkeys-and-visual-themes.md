# Task 14: Custom Global Hotkeys & Visual Theme Customizer

**Status**: ⏳ Planned  
**Milestone**: M14  
**Estimated Complexity**: Medium

---

## Objectives
1. Provide personalized accessibility, custom keybinding ergonomics, and customizable aesthetic themes across both the Manager application and Quick Picker companion.
2. **Customizable Global Summon Hotkey**:
   - Enable users to rebind the companion hotkey (default `Alt+Shift+V` / `Option+Shift+V`) in Settings.
   - Interactive key recorder UI component that captures keystroke combinations (`Ctrl`, `Alt`, `Shift`, `Meta` + key).
   - Real-time conflict validation against OS-reserved shortcuts with fallback to previous valid keybinding.
   - Dynamic IPC unregister and re-register without application restart.
3. **Multi-Theme Visual Styling Engine**:
   - Provide curated visual themes:
     - `slate_dark`: Default sleek dark charcoal palette.
     - `oled_black`: Pure `#000000` AMOLED high-contrast mode with crisp neon borders.
     - `cyberpunk`: Deep purple/cyan glow accents with futuristic typography.
     - `catppuccin`: Soothing pastel mocha aesthetic.
     - `paper_light`: High-contrast daylight theme for bright office environments.
   - Synchronize active theme instantly across both Manager and Quick Picker windows via IPC.
4. **Automated Unit Tests**:
   - Keystroke parsing, electron accelerator formatting, and theme setting persistence.

---

## Implementation Checklist
- [ ] Extend `AppSettings` in `src/types/models.ts` with `globalHotkey: string` and `theme: ThemeId`.
- [ ] Implement hotkey validator and dynamic registration manager in `src/main/shortcuts/global-shortcuts.ts`.
- [ ] Build interactive `HotkeyRecorder.tsx` component for `SettingsModal.tsx`.
- [ ] Add theme token definitions and CSS theme engine in `src/renderer/styles/themes.css`.
- [ ] Add theme selector in `SettingsModal.tsx` and sync theme attribute across `document.documentElement`.
- [ ] Write unit tests in `tests/unit/theme-and-hotkey.test.ts`.
- [ ] Run test suite (`npm run test`) and production build (`npm run build`).

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M14 status).
3. Run tests: `npm run test && npm run build`.
4. Commit: `git commit -m "feat(settings): add custom global hotkey rebinding and visual theme engine"`.
