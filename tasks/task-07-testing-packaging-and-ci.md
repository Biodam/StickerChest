# Task 07: Testing, Packaging & CI

**Status**: 🟢 Completed  
**Milestone**: M7  
**Estimated Complexity**: Medium

---

## Objectives
1. Implement full unit and integration test coverage across the data layer, resizer, Gemini parser, and IPC contracts.
2. Configure `electron-builder` for multiplatform distribution (Windows portable/installer and macOS DMG/zip).
3. Set up GitHub Actions CI workflow to run linter, typecheck, unit tests, and build artifacts on commit/PR.
4. Verify all documentation, standards, and tasks reflect current status.

---

## Implementation Checklist
- [x] Configure `vitest` with end-to-end integration test (`tests/integration/end-to-end.test.ts`) covering ingestion, Sharp resizing, Gemini parsing, FTS5 multi-dimensional query, favorites, and usage tracking.
- [x] Set up `electron-builder.json` with cross-platform targets:
  - Windows: NSIS installer and portable `.exe`
  - macOS: `.dmg` and `.zip` (with universal binary or x64/arm64 targets)
  - Linux: AppImage and tar.gz
- [x] Create `.github/workflows/ci.yml` running tests and build checks on Windows and macOS.
- [x] Verify clean builds and 100% test pass rate across all 6 test suites.
- [x] Ensure all tasks in `tasks/` and milestones in `tasks/milestones.md` are up to date.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M7 status).
3. Run tests: `npm run test && npm run build`.
4. Commit: `git commit -m "chore(ci): configure electron-builder packaging and automated ci pipeline"`.
