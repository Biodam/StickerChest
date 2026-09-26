# Task 05: Database Manager Desktop UI

**Status**: ⚪ Not Started  
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
- [ ] Implement layout framework (sidebar, header with global search, main content area, inspector drawer) using Tailwind CSS.
- [ ] Create virtualized sticker grid (`@tanstack/react-virtual` or custom virtualization) using Tier 3 thumbnail previews.
- [ ] Implement inspector panel for displaying and editing item details.
- [ ] Implement filtering controls: by source franchise, character, feeling, animation type, or favorite status.
- [ ] Build Settings modal for directory paths and Gemini API key management.
- [ ] Wire IPC hooks to sync state in real time with backend events.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M5 status).
3. Run tests: `npm run test`.
4. Commit: `git commit -m "feat(ui): implement main database manager and inspector desktop app"`.
