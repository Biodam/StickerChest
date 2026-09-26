# Task 03: Image Ingestion & Resizing Pipeline

**Status**: ⚪ Not Started  
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
- [ ] Create `src/main/services/imaging/hasher.ts` calculating streaming SHA-256.
- [ ] Create `src/main/services/imaging/resizer.ts` with methods:
  - `generateStickerVariant(inputPath, outputPath, isAnimated)`
  - `generateEmojiVariant(inputPath, outputPath, isAnimated)`
  - `generateThumbnailVariant(inputPath, outputPath, isAnimated)`
- [ ] Ensure animated GIF frame delays and loop headers are preserved during resize.
- [ ] Create `src/main/services/ingestion/scanner.ts` with batch queue execution and event emitters for UI progress.
- [ ] Write tests in `tests/unit/imaging.test.ts` verifying image dimensions and format compliance.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M3 status).
3. Run tests: `npm run test`.
4. Commit: `git commit -m "feat(pipeline): implement image ingestion, sha256 hashing, and sharp resizing"`.
