# Task 01: Core Architecture & Scaffolding

**Status**: 🟢 Completed  
**Milestone**: M1  
**Estimated Complexity**: Medium

---

## Objectives
1. Initialize the root `package.json` with dependencies for Electron, React, TypeScript, Vite, Tailwind CSS, Sharp, and SQLite.
2. Configure TypeScript configurations (`tsconfig.json`, `tsconfig.node.json`).
3. Set up dual-window Vite multi-page build configuration (one bundle for `manager`, one for `picker`).
4. Establish the Electron Main process entrypoint (`src/main/index.ts`) managing window lifecycles and IPC foundations.
5. Create standard preload bridges with TypeScript typing (`src/preload/`).
6. Set up Vitest for automated testing.

---

## Implementation Checklist
- [x] Initialize `package.json` with required scripts (`dev`, `build`, `test`).
- [x] Install dependencies:
  - Runtime: `electron`, `better-sqlite3`, `sharp`, `dotenv`, `@google/genai`, `chokidar`
  - Dev/UI: `react`, `react-dom`, `vite`, `vite-plugin-electron`, `tailwindcss`, `lucide-react`, `vitest`, `typescript`
- [x] Configure `vite.config.ts` supporting dual renderer entrypoints:
  - `src/renderer/manager/index.html`
  - `src/renderer/picker/index.html`
- [x] Create skeleton Electron main controller with dual window initialization and global shortcuts.
- [x] Verify build compilation (`npm run build`).
- [x] Add basic test runner check (`npm run test`) with passing in-memory SQLite+FTS5 and Sharp tests.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M1 status).
3. Run tests: `npm run test`.
4. Commit: `git commit -m "feat: scaffold core architecture and dual-window electron setup"`.
