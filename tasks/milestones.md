# Milestones Roadmap: StickerVault

This document tracks high-level progress across the core development milestones of the project.

---

## Contributor & AI Agent Workflow Rule
> [!IMPORTANT]
> **Mandatory Rule for All Tasks**:
> After completing each task or milestone implementation:
> 1. Update the corresponding task file in `tasks/` and this `milestones.md` with completed items and notes.
> 2. Update any relevant definitions in `docs/` if specifications evolved during implementation.
> 3. Run the automated test suites to ensure zero regressions.
> 4. Create a clean git commit describing the completed milestone or task.

---

## Milestones Summary

| Milestone | Title | Target Scope | Status |
|---|---|---|---|
| **M1** | **Core Architecture & Scaffolding** | Monorepo setup, Electron + Vite + React + TS, build configurations, linting | 🟡 Pending Start |
| **M2** | **Database Engine & FTS5** | SQLite 3 setup, migrations, FTS5 triggers, DAL queries, usage stats | ⚪ Not Started |
| **M3** | **Ingestion & Resizing Pipeline** | SHA-256 deduplication, Sharp multi-tier resizing (emoji, sticker, thumb), GIF support | ⚪ Not Started |
| **M4** | **Gemini AI Metadata Tagger** | GenAI SDK integration, vision prompt schema, batch queue, manual metadata override | ⚪ Not Started |
| **M5** | **Manager Desktop UI** | Library grid, search/filter sidebar, inspector drawer, bulk tagger, settings | ⚪ Not Started |
| **M6** | **Quick Picker Companion Panel** | Frameless floating modal, global hotkey (`Alt+Shift+V`), Recent/Favs/All tabs, copy to clipboard | ⚪ Not Started |
| **M7** | **Testing, Verification & Packaging** | Unit/integration test suites, cross-platform build scripts (Windows & macOS) | ⚪ Not Started |

---

## Detailed Task Breakdown

- [ ] [Task 01: Core Architecture & Scaffolding](file:///c:/Projects/sticker-database-manager/tasks/task-01-core-architecture-and-scaffolding.md)
- [ ] [Task 02: Database Engine & FTS5](file:///c:/Projects/sticker-database-manager/tasks/task-02-database-engine-and-fts.md)
- [ ] [Task 03: Image Ingestion & Resizing Pipeline](file:///c:/Projects/sticker-database-manager/tasks/task-03-image-ingestion-and-resizing-pipeline.md)
- [ ] [Task 04: Gemini AI Metadata Tagger](file:///c:/Projects/sticker-database-manager/tasks/task-04-gemini-ai-metadata-tagger.md)
- [ ] [Task 05: Database Manager Desktop UI](file:///c:/Projects/sticker-database-manager/tasks/task-05-database-manager-desktop-ui.md)
- [ ] [Task 06: Quick Picker Companion Panel](file:///c:/Projects/sticker-database-manager/tasks/task-06-quick-picker-companion-panel.md)
- [ ] [Task 07: Testing, Packaging & CI](file:///c:/Projects/sticker-database-manager/tasks/task-07-testing-packaging-and-ci.md)
