# Task 12: Animated Sticker & GIF Playback & Optimization Controls

**Status**: 🟢 Completed  
**Milestone**: M12  
**Estimated Complexity**: Medium

---

## Objectives
1. Provide advanced playback controls and rendering optimizations for animated stickers (GIF, animated WebP, APNG) across both the Manager grid and Quick Picker companion.
2. **Animation Playback Modes** in Settings:
   - `always`: Animate all visible stickers continuously.
   - `hover`: Render a lightweight static poster/first frame, and animate only when hovered by mouse or selected via keyboard.
   - `reduced_motion`: Strict static rendering conforming to accessibility standards with a manual click-to-preview toggle.
3. **Offscreen Animation Pausing (Performance Optimization)**:
   - Use `IntersectionObserver` on grid viewports to disconnect/freeze offscreen animated assets, drastically lowering CPU and GPU compositor overhead when navigating vaults with hundreds of animated stickers.
4. **Inspector Frame Scrubber & Animation Telemetry**:
   - Display animation telemetry in the Manager Inspector: total frame count, estimated playback duration, dimensions, and frame delays.
   - Interactive frame scrubber to inspect individual animation frames.
5. **Automated Unit Tests**:
   - Unit tests for animation settings schema, playback state reducer, and frame calculation utilities.

---

## Implementation Checklist
- [x] Extend `AppSettings` in `src/types/models.ts` with `animationPlaybackMode: 'always' | 'hover' | 'reduced_motion'`.
- [x] Add playback configuration controls to `SettingsModal.tsx`.
- [x] Create an optimized `AnimatedStickerImage` component utilizing `IntersectionObserver` and hover-to-play state.
- [x] Update `PickerGrid.tsx` and `StickerCard.tsx` to support hover-to-play and keyboard-focus animation trigger.
- [x] Add animation frame preview & telemetry section with play/pause controls to `InspectorDrawer.tsx`.
- [x] Write unit tests in `tests/unit/animation-controls.test.ts` (4 passing tests).
- [x] Run test suite (`npm run test`: 76/76 passing) and production build (`npm run build`).

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M12 status).
3. Run tests: `npm run test && npm run build`.
4. Commit: `git commit -m "feat(animation): implement animated sticker playback controls and viewport optimizations"`.

