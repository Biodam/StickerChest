# Task 05: Database Manager Desktop UI

**Status**: 🟢 Completed  
**Milestone**: M5  
**Estimated Complexity**: High

---

## Objectives
1. Implement the Main Window React application for browsing, inspecting, and managing the sticker database.
2. Build a high-performance virtualized grid to render thousands of stickers smoothly.
3. Build the metadata inspector drawer displaying:
   - Preview of raw, sticker, and emoji variants
   - Character, source, action, and feeling tags
   - Interactive tag chips (add, delete, custom tags)
   - Copy count and favorite toggle
4. Provide ingestion status dashboard showing active scan/resizing/AI tagging progress.
5. Provide a Settings view to configure the source folder, Gemini API key, and shortcuts.

---

## Implementation Checklist
- [x] Implement layout framework (`Sidebar.tsx`, `Header.tsx`, `StickerGrid.tsx`, `InspectorDrawer.tsx`, `SettingsModal.tsx`, `IngestionBanner.tsx`) using Tailwind CSS.
- [x] Create responsive sticker grid with thumbnail previews, GIF badges, and empty states.
- [x] Implement inspector drawer for displaying and editing item details, adding/removing tags, and re-analyzing with Gemini.
- [x] Add user-edited metadata marking (`is_user_edited = 1`), user-locked fields, and lock indicators in UI with AI overwrite protection guarantee.
- [x] Implement filtering controls: All, Recent, Favorites, Animated GIFs, and real-time full-text search.
- [x] Implement dynamic facet filters in the sidebar: Franchises, Characters, and Tags, frequency-sorted with count badges and active filter chips.
- [x] Build Settings modal with folder selection dialog and Gemini API key verification.
- [x] Wire IPC hooks (`settings:get`, `settings:save`, `vault:scan`, `vault:progress`, `db:search`, `db:updateMetadata`, `gemini:batchTag`, `gemini:getUntaggedCount`) for real-time synchronization.
- [x] Add "Batch AI Tag (N)" action button in Header with live untagged counter and real-time progress banner.
- [x] Eliminate infinite re-selection loop and isolate form input state so metadata edits and tags persist without reset.
- [x] Add interactive Grid Size Control (`GridSizeControl.tsx`, `useGridSize.ts`) with Small/Medium/Large presets, slider, and persistent localStorage setting.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M5 status).
3. Run tests: `npm run test`.
4. Commit: `git commit -m "feat(ui): implement main database manager and inspector desktop app"`.
