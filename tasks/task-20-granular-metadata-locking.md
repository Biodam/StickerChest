# Task 20: Granular Field-Level Metadata Locking & Selective AI Updates

## Overview
Enable field-granular protection so that editing individual sticker metadata fields (e.g., character, source, action, feeling, description, or tags) does not lock the entire sticker record. Unedited fields remain unlocked, allowing subsequent AI tagging and parsing runs (e.g. Gemini Vision) to update unedited values while preserving user customizations.

---

## Key Deliverables & Implementation Details

- [x] **Database Layer (`metadata-queries.ts`)**:
  - `upsertMetadata`: Support explicit `userLockedFields` array input (including empty `[]` for unlocking) instead of permanently accumulating locks.
  - Fallback dirty checking: When `userLockedFields` is omitted, only lock fields whose values changed relative to the database.
  - `setTags`: Preserve `is_ai_generated = 1` for existing AI tags during user tag updates, ensuring user additions (`is_ai_generated = 0`) are protected while AI tags can be refreshed during re-tagging.
- [x] **IPC Channel (`db-handlers.ts`)**:
  - Fix `db:updateMetadata` to stop blindly locking all 5 fields when defined in the payload.
  - Stop forcing `aiStatus: 'manual_only'`, allowing existing or partial AI statuses to persist.
- [x] **Manager UI (`MetadataForm.tsx`)**:
  - Interactive lock toggle buttons (`Locked` / `Unlocked`) with visual states and tooltips next to each metadata field.
  - Auto-locking on dirty field modification: Typing in a field automatically protects it.
  - Granular save payload: Sends only the explicitly/dirty-locked fields in `userLockedFields`.
  - Header feedback indicating the count of protected fields.
- [x] **Automated Verification (`database.test.ts`)**:
  - Added unit tests for field unlocking, partial lock preservation, and selective AI tag refreshing.
