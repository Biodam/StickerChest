# StickerVault — Sticker & Emoji Database Manager

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

**StickerVault** is a local-first, cross-platform desktop application (Windows & macOS, extensible to Linux) designed to manage, auto-resize, AI-tag, and instantly summon curated sticker and emoji collections.

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
  - **Main Manager Window**: Complete database explorer, metadata editor, ingestion monitor, and configuration.
  - **Quick Picker Companion Panel**: Global shortcut (`Alt + Shift + V` / `Option + Shift + V`) summons a lightweight, floating, borderless modal (similar to the Windows `Win + .` emoji panel) featuring **Recent**, **Favorites**, and **All** tabs, search-as-you-type, and one-click copy directly into your system clipboard for instant pasting into Discord, Slack, Telegram, etc.

---

## 📂 Project Architecture & Documentation

- **[`AGENTS.md`](file:///c:/Projects/sticker-database-manager/AGENTS.md)**: Agent instructions, modularity rules, file size limits, and naming conventions.
- **[`docs/standards/image-standards.md`](file:///c:/Projects/sticker-database-manager/docs/standards/image-standards.md)**: Sizing tiers, animated GIF handling, aspect ratio and format standards.
- **[`docs/standards/metadata-definitions.md`](file:///c:/Projects/sticker-database-manager/docs/standards/metadata-definitions.md)**: Metadata taxonomy, Gemini prompt schema, custom attributes, and search ranking.
- **[`docs/standards/database-schema.md`](file:///c:/Projects/sticker-database-manager/docs/standards/database-schema.md)**: SQLite 3 tables, triggers, and FTS5 virtual table specifications.
- **[`docs/standards/cloud-drive-compatibility.md`](file:///c:/Projects/sticker-database-manager/docs/standards/cloud-drive-compatibility.md)**: Google Drive Desktop & OneDrive compatibility, file stability locks, and periodic sync.
- **[`docs/architecture/system-overview.md`](file:///c:/Projects/sticker-database-manager/docs/architecture/system-overview.md)**: Electron multi-process design, IPC channels, window lifecycle, and clipboard dispatch.
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
git clone <repo-url>
cd sticker-database-manager

# Install dependencies
npm install

# Start development mode (Electron Main + Vite Renderers)
npm run dev
```

### Running Tests
```bash
npm run test
```

---

## 📄 License
MIT License
