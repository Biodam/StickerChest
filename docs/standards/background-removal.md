# Background Removal Pipeline

Sticker Chest includes an offline, on-device AI background removal feature powered by `@imgly/background-removal-node` running ONNX models.

## Overview
- **Zero API Key Required**: Runs entirely locally on the user's machine using WebAssembly/ONNX runtime.
- **Process Isolation**: The background removal runtime is executed in an isolated worker child process (`src/main/workers/background-worker.ts`), preventing memory leaks and avoiding native library collisions with Electron's Sharp instance.
- **Non-Destructive**: Generates a new transparent PNG file alongside the original (e.g. `sticker-nobg.png`) and automatically ingests it into the database with variants and preserves existing tags.
- **Single & Bulk Support**:
  - Accessible via **InspectorDrawer** for single sticker operations.
  - Accessible via **BulkActionBar** for multi-select batch background removal.
  - Animated stickers/GIFs are automatically protected/disabled from background removal.
