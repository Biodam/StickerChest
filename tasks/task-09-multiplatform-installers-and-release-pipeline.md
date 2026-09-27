# Task 09: Multiplatform Installers & Release Pipeline

**Status**: 🟢 Completed  
**Milestone**: M9  
**Estimated Complexity**: High

---

## Objectives
1. Design and generate high-resolution application branding icons for Windows (`.ico`), macOS (`.icns`), Linux (`.png`), and the system tray (`resources/`).
2. Build production-grade Windows installers:
   - NSIS Installer (`.exe` with desktop shortcut, start menu entry, custom install path, and clean uninstaller)
   - Portable Windows executable (`.exe` for standalone USB usage)
3. Build production-grade macOS installers:
   - Apple Disk Image (`.dmg` with visual drag-and-drop to `/Applications` symlink)
   - Standalone zipped app bundle (`.zip`) supporting both Apple Silicon (`arm64`) and Intel (`x64`)
4. Configure package build scripts in `package.json`:
   - `npm run dist:win` (Windows NSIS + Portable)
   - `npm run dist:mac` (macOS DMG + Zip)
   - `npm run dist:all` (Complete cross-platform bundle)
   - `npm run generate-icons` (Sharp-based master icon generator)
5. Set up an automated GitHub Actions Release pipeline (`.github/workflows/release.yml`) that compiles native dependencies (`better-sqlite3`, `sharp`) on native OS runners (`windows-latest`, `macos-latest`) and publishes installer binaries to GitHub Releases.

---

## Implementation Checklist
- [x] Create `resources/` asset directory with high-res icon assets via `scripts/generate-icons.js`:
  - `icon.ico` (multi-res 16px to 256px for Windows taskbar and installer)
  - `icon.png` (512x512 master PNG)
  - `tray-icon.png` and `tray-icon@2x.png` (16x16 and 32x32 monochrome template icons for system tray)
- [x] Update `electron-builder.json` with complete installer configurations:
  - Windows: NSIS configuration, shortcut names, architecture targets (`x64`), portable executable
  - macOS: DMG layout (`window`, `contents` with `/Applications` link), architectures (`arm64`, `x64`)
  - Linux: AppImage, desktop categories
  - Top-level `dmg` layout and `extraResources` asset mapping
- [x] Add installer build scripts in `package.json`:
  - `"generate-icons": "node scripts/generate-icons.js"`
  - `"dist:win": "npm run build && electron-builder --win"`
  - `"dist:mac": "npm run build && electron-builder --mac"`
  - `"dist:all": "npm run build && electron-builder -mwl"`
- [x] Create `.github/workflows/release.yml` with dual-OS matrix build (`windows-latest`, `macos-latest`) to compile native C++ modules on their respective native platforms and publish release assets.
- [x] Test and verify electron-builder configuration.
- [x] Successfully deployed first production release `v0.0.1` via GitHub Actions with Windows & macOS multiplatform installers.
- [x] Setup quota and repository visibility preflight checks (`scripts/check-quota.js`, CI & Release workflow preflight jobs, concurrency auto-cancel).

---

## Release Verification (v0.0.1)
- **Tag**: `v0.0.1`
- **Release URL**: [https://github.com/Biodam/sticker-database-manager/releases/tag/v0.0.1](https://github.com/Biodam/sticker-database-manager/releases/tag/v0.0.1)
- **Published Artifacts**:
  - `StickerVault.Setup.0.0.1.exe` (Windows NSIS Setup Installer)
  - `StickerVault.0.0.1.exe` (Windows Standalone Portable Executable)
  - `StickerVault-0.0.1.dmg` (macOS Intel x64 DMG)
  - `StickerVault-0.0.1-arm64.dmg` (macOS Apple Silicon arm64 DMG)
  - `StickerVault-0.0.1-mac.zip` (macOS Intel x64 App Bundle)
  - `StickerVault-0.0.1-arm64-mac.zip` (macOS Apple Silicon App Bundle)
  - `latest.yml` & `latest-mac.yml` (Auto-update distribution manifests)

---

## Quota & Cost Protection System
- **Local Preflight Tool**: `npm run check-quota` inspects repository visibility and live GitHub Actions billing minutes before any builds fire.
- **Release Guard**: `npm run release` automatically runs `checkQuota({ strict: true })` prior to version bumping or tag creation.
- **CI / Release Matrix Guard**: `check-quota` job runs on `ubuntu-latest` before any Windows or macOS matrix builders are started. If the repo is private and `ALLOW_PRIVATE_BUILDS` is not explicitly set, the run fails immediately without consuming billable runner minutes.
- **Concurrency Control**: Automatic cancellation of superseded in-progress builds (`concurrency: cancel-in-progress: true`) across both CI and Release workflows.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M9 status).
3. Run tests: `npm run test && npm run build`.
4. Commit: `git commit -m "chore(dist): configure windows nsis installer, macos dmg, and github release pipeline"`.

