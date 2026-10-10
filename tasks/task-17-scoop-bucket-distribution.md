# Task 17: Scoop Custom Bucket Distribution

## Status: 🟢 Completed

---

## 1. Objective
Establish a zero-approval, friction-free Windows distribution channel using a custom **Scoop Bucket** directly integrated with the GitHub repository releases.

---

## 2. Deliverables
- [x] **`bucket/sticker-chest.json`**: Official Scoop app manifest pointing to portable release binary (`v0.0.7`), SHA256 checksum, Start Menu shortcut configuration, and automated version update schema (`autoupdate` & `checkver`).
- [x] **`docs/standards/scoop-distribution.md`**: Standard documentation outlining bucket setup, developer maintenance, and client-side PowerShell commands.
- [x] **Verification**: Validate JSON syntax, verify file hash matching release asset, and update milestones roadmap.

---

## 3. Client Usage Reference
```powershell
scoop bucket add stickerchest https://github.com/Biodam/StickerChest.git
scoop install stickerchest/sticker-chest
```
