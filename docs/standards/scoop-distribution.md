# Scoop Custom Bucket Distribution

This repository functions as a standalone **Scoop bucket** in addition to the main application source code. Windows power users can install, launch, and update **Sticker Chest** without administrative privileges or installers.

---

## 1. Bucket Repository Structure

```text
sticker-database-manager/
└── bucket/
    └── sticker-chest.json    # Scoop application manifest
```

---

## 2. Client Installation Instructions

### Step 1: Install Scoop (Prerequisite)
If the user does not already have Scoop installed, run the following in PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex
```

### Step 2: Add the Sticker Chest Bucket
```powershell
scoop bucket add stickerchest https://github.com/Biodam/StickerChest.git
```

### Step 3: Install Sticker Chest
```powershell
scoop install stickerchest/sticker-chest
```

This downloads the portable Windows release, verifies its SHA-256 integrity hash, links the executable, and creates a Start Menu shortcut under **Sticker Chest**.

---

## 3. Client Updates & Uninstallation

### Updating
```powershell
scoop update
scoop update sticker-chest
```

### Uninstalling
```powershell
scoop uninstall sticker-chest
```

---

## 4. Manifest Maintenance & Autoupdate Schema

The manifest file [`bucket/sticker-chest.json`](file:///c:/Projects/sticker-database-manager/bucket/sticker-chest.json) contains native Scoop autoupdate rules:

- **`checkver: "github"`**: Checks the latest GitHub release tag on `Biodam/StickerChest`.
- **`autoupdate`**: Automatically resolves the download URL pattern `Sticker.Chest.$version.exe` for newer releases.
- **`hash`** / **`version`** / **`url`**: Updated automatically after every release by the `update-scoop-manifest` job in [release.yml](file:///c:/Projects/sticker-database-manager/.github/workflows/release.yml), which downloads the portable `.exe` from the published release, runs [update-scoop-manifest.js](file:///c:/Projects/sticker-database-manager/scripts/update-scoop-manifest.js), and commits `bucket/sticker-chest.json` to the default branch. To run it manually: `node scripts/update-scoop-manifest.js <version> <path-to-exe>`.
