# Task 07: Testing, Packaging & CI

**Status**: ⚪ Not Started  
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
- [ ] Configure `vitest` with end-to-end integration tests.
- [ ] Set up `electron-builder.yml` / configuration in `package.json`:
  - Windows: NSIS installer and portable `.exe`
  - macOS: `.dmg` and `.zip` (with universal binary or x64/arm64 targets)
- [ ] Create `.github/workflows/ci.yml` running tests and build checks.
- [ ] Verify clean builds on Windows and validate macOS configuration.
- [ ] Ensure all tasks in `tasks/` and milestones in `tasks/milestones.md` are up to date.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M7 status).
3. Run tests: `npm run test && npm run build`.
4. Commit: `git commit -m "chore(ci): configure electron-builder packaging and automated ci pipeline"`.
