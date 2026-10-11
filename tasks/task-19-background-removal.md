# Task 19: Local AI Background Removal

- [x] Install `@imgly/background-removal-node` dependency
- [x] Create worker process in `src/main/workers/background-worker.ts`
- [x] Create non-destructive filename resolver `src/main/services/imaging/background-paths.ts`
- [x] Create isolated background removal orchestrator `src/main/services/imaging/background-remover.ts`
- [x] Register IPC channel `image:removeBackground` and connect to main/preload bridges
- [x] Add "Remove Background" action button to `InspectorDrawer.tsx`
- [x] Add "Remove BG" action button to `BulkActionBar.tsx` with loading state
- [x] Automatically ingest transparent result, generate standard resized tiers, and inherit existing tags
- [x] Add unit tests for path generation and MIME resolution in `tests/unit/background-paths.test.ts`
- [x] Verify Vite build and bundling targets for background worker
