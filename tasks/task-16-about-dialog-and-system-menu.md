# Task 16: Help Menu & About Information Dialog

## Status: 🟢 Completed

### Objectives
- [x] Provide a native application menu with `Help -> About Sticker Chest` (shortcut `F1`) and documentation / repository links.
- [x] Add `About Sticker Chest` option to tray icon context menu.
- [x] Add an "About" button in the Database Manager sidebar footer.
- [x] Implement backend `getAboutInfo()` service to read runtime metadata:
  - App name & version (`process.env.npm_package_version` / `app.getVersion()`)
  - Git commit hash (retrieved via `git rev-parse --short HEAD` during build and exposed in `vite.config.ts`)
  - Electron, Chromium, Node.js, and V8 engine versions
  - OS platform, architecture, and kernel release
  - Vault root path and SQLite database path
  - Total cataloged sticker count
- [x] Build an `AboutModal` dialog with 1-click commit hash copying, formatted paths, and quick links to documentation and issue reporting.
- [x] Comprehensive unit tests for `about-service.ts`.
