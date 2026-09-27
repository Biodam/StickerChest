# Task 09: Multiplatform Installers & Release Pipeline

**Status**: 🟡 Planned  
**Milestone**: M9  
**Estimated Complexity**: High

---

## Objectives
1. Design and generate high-resolution application branding icons for Windows (`.ico`), macOS (`.icns`), Linux (`.png`), and the system tray.
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
5. Set up an automated GitHub Actions Release pipeline (`.github/workflows/release.yml`) that compiles native dependencies (`better-sqlite3`, `sharp`) on native OS runners (`windows-latest`, `macos-latest`) and publishes installer binaries to GitHub Releases.

---

## Implementation Checklist
- [ ] Create `resources/` asset directory with high-res icon assets:
  - `icon.ico` (multi-res 16px to 256px for Windows taskbar and installer)
  - `icon.icns` (512px & 1024px for macOS Finder and Dock)
  - `icon.png` (512x512 master PNG)
  - `tray-icon.png` and `tray-icon@2x.png` (16x16 and 32x32 monochrome template icons for system tray)
- [ ] Update `electron-builder.json` with complete installer configurations:
  - Windows: NSIS configuration, shortcut names, architecture targets (`x64`)
  - macOS: DMG layout (`window`, `contents` with `/Applications` link), architectures (`arm64`, `x64`)
  - Linux: AppImage, desktop categories
- [ ] Add installer build scripts in `package.json`:
  - `"dist:win": "npm run build && electron-builder --win"`
  - `"dist:mac": "npm run build && electron-builder --mac"`
  - `"dist:all": "npm run build && electron-builder -mwl"`
- [ ] Create `.github/workflows/release.yml` with dual-OS matrix build (`windows-latest`, `macos-latest`) to compile native C++ modules on their respective native platforms and publish release assets.
- [ ] Build and verify Windows NSIS installer locally in `release/`.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M9 status).
3. Test local installer: install, verify desktop shortcut, run, and uninstall cleanly.
4. Commit: `git commit -m "chore(dist): configure windows nsis installer, macos dmg, and github release pipeline"`.
