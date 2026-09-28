# Sticker Chest — Sticker & Emoji Database Manager

> ⚠️ **DISCLAIMER: AI-GENERATED APPLICATION**  
> This software is **entirely AI-generated** by Antigravity (Google DeepMind). All architecture, source code, documentation, and task plans were produced autonomously under prompt direction.

---

## 📋 Contributor & AI Agent Workflow Rule

> [!IMPORTANT]
> **Mandatory Rule for All Development Tasks**:  
> Upon completing any task or milestone implementation, the developer or AI agent **must**:
> 1. Update the corresponding specification in [`docs/`](file:///c:/Projects/sticker-database-manager/docs/) if any design or standard evolved.
> 2. Mark the completed checklist items in [`tasks/`](file:///c:/Projects/sticker-database-manager/tasks/) and update [`tasks/milestones.md`](file:///c:/Projects/sticker-database-manager/tasks/milestones.md).
> 3. Run the automated test suite (`npm run test`) to guarantee zero regressions.
> 4. Create a clean, well-described git commit before moving to the next task.

---

## 🌟 Overview

**Sticker Chest** is a local-first, cross-platform desktop application (Windows & macOS, extensible to Linux) designed to manage, auto-resize, AI-tag, and instantly summon curated sticker and emoji collections.

### Core Capabilities

- 📁 **Curated Local Folder Ingestion**: Monitors a local folder of source images and animated GIFs with SHA-256 deduplication.
- 📐 **Automatic Standards Resizing**:
  - **Sticker Standard**: Max 512×512 (optimized WebP / animated GIF / WebP).
  - **Emoji Standard**: Max 128×128 (inline reaction size).
  - **Thumbnail Tier**: 96×96 (sub-millisecond grid virtualization).
  - *Full animation preservation for multi-frame GIFs and WebP.*
- 🧠 **Gemini AI Vision Metadata Tagging**:
  - Automatically identifies **character**, **source franchise/game/anime**, **physical action**, **emotional feeling/reaction**, and **semantic search tags** using Gemini 2.5 Flash.
  - Supports user-configured custom metadata and manual tag overrides.
- ⚡ **SQLite 3 + FTS5 Full-Text Search**:
  - Sub-5ms search across characters, series, feelings, actions, and tags with BM25 ranking and prefix matching.
- 🖥️ **Dual-Window Desktop Experience**:
- ⌨️ **Quick Picker Auto-Paste & Full Keyboard Interaction**:
  - Global summon (`Win + /` on Windows, `Control + /` on macOS).
  - **Auto-Paste**: Select a sticker to automatically copy and paste it into your active input field (Discord, Slack, WhatsApp, browser) with simulated keystrokes.
  - **Full Keyboard Navigation**: 2D arrow keys (`↑↓←→`), Home/End, PageUp/Down, tab switching (`Ctrl+1/2/3`), resolution toggle (`Ctrl+T`), and star bookmarking (`Ctrl+S`).
- 🔔 **System Tray & 24/7 Companion Daemon**:
  - Closing the Manager window hides it to the system tray, keeping the Quick Picker active and summoned instantly with zero startup lag.
- 📦 **Bulk Tagging & Drag-and-Drop Ingestion**:
  - Drag and drop images directly into the Manager window to ingest without re-scanning folders.
  - Multi-select stickers (`Ctrl+Click`, `Shift+Click`, `Ctrl+A`) for batch tagging, favoriting, or deleting.

---

## 📦 Downloads & Releases

Prebuilt multiplatform installers for Windows and macOS are published under [GitHub Releases](https://github.com/Biodam/StickerChest/releases):

| Platform | Format | Installer Download |
|---|---|---|
| **Windows** | Setup Installer | [`Sticker.Chest.Setup.0.0.2.exe`](https://github.com/Biodam/StickerChest/releases/download/v0.0.2/Sticker.Chest.Setup.0.0.2.exe) |
| **Windows** | Portable Executable | [`Sticker.Chest.0.0.2.exe`](https://github.com/Biodam/StickerChest/releases/download/v0.0.2/Sticker.Chest.0.0.2.exe) |
| **macOS (Apple Silicon)** | Disk Image (DMG) | [`Sticker.Chest-0.0.2-arm64.dmg`](https://github.com/Biodam/StickerChest/releases/download/v0.0.2/Sticker.Chest-0.0.2-arm64.dmg) |

---

## 📂 Project Architecture & Documentation

- **[`AGENTS.md`](file:///c:/Projects/sticker-database-manager/AGENTS.md)**: Agent instructions, modularity rules, file size limits, and naming conventions.
- **[`docs/standards/keyboard-shortcuts.md`](file:///c:/Projects/sticker-database-manager/docs/standards/keyboard-shortcuts.md)**: Complete keyboard shortcut manual for Quick Picker and Manager.
- **[`docs/standards/packaging-and-releases.md`](file:///c:/Projects/sticker-database-manager/docs/standards/packaging-and-releases.md)**: Multiplatform installer configurations, CI/CD pipeline, and quota protection.
- **[`docs/standards/image-standards.md`](file:///c:/Projects/sticker-database-manager/docs/standards/image-standards.md)**: Sizing tiers, animated GIF handling, aspect ratio and format standards.
- **[`docs/standards/metadata-definitions.md`](file:///c:/Projects/sticker-database-manager/docs/standards/metadata-definitions.md)**: Metadata taxonomy, Gemini prompt schema, custom attributes, and search ranking.
- **[`docs/standards/database-schema.md`](file:///c:/Projects/sticker-database-manager/docs/standards/database-schema.md)**: SQLite 3 tables, triggers, and FTS5 virtual table specifications.
- **[`docs/standards/cloud-drive-compatibility.md`](file:///c:/Projects/sticker-database-manager/docs/standards/cloud-drive-compatibility.md)**: Google Drive Desktop & OneDrive compatibility, file stability locks, and periodic sync.
- **[`docs/architecture/system-overview.md`](file:///c:/Projects/sticker-database-manager/docs/architecture/system-overview.md)**: Electron multi-process design, IPC channels, window lifecycle, and auto-paste engine.
- **[`tasks/milestones.md`](file:///c:/Projects/sticker-database-manager/tasks/milestones.md)**: Milestone roadmap tracking development progress.

---

## 🛠️ Tech Stack

- **Runtime**: [Electron](https://www.electronjs.org/) + [Node.js](https://nodejs.org/)
- **Frontend**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [SQLite 3](https://sqlite.org/) via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3) with FTS5 enabled
- **Image Processing**: [`sharp`](https://sharp.pixelplumbing.com/) (libvips) with multi-frame animated GIF/WebP support
- **AI Vision**: Google Gemini API via [`@google/genai`](https://www.npmjs.com/package/@google/genai)
- **Testing**: [Vitest](https://vitest.dev/)

---

## 🚀 Quick Start (Development)

### Prerequisites
- Node.js >= 20 (Node.js v24 detected)
- npm or pnpm
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/Biodam/StickerChest.git
cd StickerChest

# Install dependencies
npm install

# Start development mode (Electron Main + Vite Renderers)
npm run dev
```

### Running Tests & Verification
```bash
# Run unit & integration test suite
npm run test

# Compile production bundles
npm run build

# Inspect GitHub Actions quota & repository visibility
npm run check-quota
```

---

## 📄 License
MIT License

