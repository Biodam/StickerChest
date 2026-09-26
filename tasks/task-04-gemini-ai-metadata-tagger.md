# Task 04: Gemini AI Metadata Tagger

**Status**: 🟢 Completed  
**Milestone**: M4  
**Estimated Complexity**: High

---

## Objectives
1. Integrate the Google GenAI SDK (`@google/genai` or `@google/generative-ai`) to analyze stickers using Gemini 2.5 Flash Vision.
2. Implement the prompt schema defined in `docs/standards/metadata-definitions.md`.
3. Build a rate-limited queue worker with retry logic and exponential backoff to handle quota limits gracefully.
4. Support manual metadata entry, custom user attributes, and tag editing.
5. Provide mock/offline testing mode to enable development without an active API key.

---

## Implementation Checklist
- [x] Create `src/main/services/gemini/client.ts` with API key configuration and health validation.
- [x] Implement `src/main/services/gemini/prompts.ts` with structured JSON schema response directives.
- [x] Create `src/main/services/gemini/queue.ts` managing concurrency and exponential backoff retry.
- [x] Write fallback parser `src/main/services/gemini/parser.ts` to handle edge cases and markdown code fences.
- [x] Implement AI tagging coordinator in `tagger-service.ts` and IPC channels in `gemini-handlers.ts`.
- [x] Write unit tests in `tests/unit/gemini.test.ts` verifying parsing, prompt structures, key management, and database FTS indexing.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M4 status).
3. Run tests: `npm run test`.
4. Commit: `git commit -m "feat(ai): integrate gemini vision tagging with rate-limited worker and schema parser"`.
