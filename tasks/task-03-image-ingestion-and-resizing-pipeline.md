# Task 03: Image Ingestion & Resizing Pipeline

**Status**: 🟢 Completed  
**Milestone**: M3  
**Estimated Complexity**: High

---

## Objectives
1. Implement the folder ingestion scanner and file watcher (`chokidar`) to monitor the user's curated folder.
2. Implement SHA-256 content hashing to ensure deduplication.
3. Build the image processing pipeline using `sharp`:
   - Static images: PNG, JPEG, WebP
   - Animated images: Animated GIF, APNG, Animated WebP
   - Tiers: `sticker` (max 512x512), `emoji` (max 128x128), `thumb` (96x96)
4. Store processed variants into organized vault storage subdirectories (`/vault/stickers`, `/vault/emojis`, `/vault/thumbs`).
5. Wire pipeline outputs into the database DAL.
6. Provide unit and integration tests verifying image dimensions, aspect ratios, and animated GIF handling.

---

## Implementation Checklist
- [x] Create `src/main/services/imaging/hasher.ts` calculating streaming SHA-256.
- [x] Create `src/main/services/imaging/format-detector.ts` detecting dimensions, format, and animation frames.
- [x] Create `src/main/services/imaging/resizer.ts` with methods:
  - `generateStickerVariant(inputPath, outputPath, isAnimated)`
  - `generateEmojiVariant(inputPath, outputPath, isAnimated)`
  - `generateThumbnailVariant(inputPath, outputPath, isAnimated)`
- [x] Ensure animated GIF/WebP frame delays and loop headers are preserved during resize.
- [x] Create `src/main/services/ingestion/` (`paths.ts`, `file-scanner.ts`, `coordinator.ts`, `folder-watcher.ts`) with batch execution and progress notifications.
- [x] Implement `src/main/services/ingestion/filename-tagger.ts` extracting emotion, character, and action keywords from snake_case, kebab-case, and CamelCase image names.
- [x] Write tests in `tests/unit/imaging.test.ts` and `tests/unit/filename-tagger.test.ts` verifying hashing, image dimensions, variants, deduplication, and database registration.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M3 status).
3. Run tests: `npm run test`.
4. Commit: `git commit -m "feat(pipeline): implement image ingestion, sha256 hashing, and sharp resizing"`.
