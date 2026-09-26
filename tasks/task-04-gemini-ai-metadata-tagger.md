# Task 04: Gemini AI Metadata Tagger

**Status**: ⚪ Not Started  
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
- [ ] Create `src/main/services/gemini/client.ts` with API key configuration and health validation.
- [ ] Implement `src/main/services/gemini/prompts.ts` with structured JSON schema response directives.
- [ ] Create `src/main/services/gemini/queue.ts` managing concurrency (e.g. max 2-3 concurrent calls) and backoff handling.
- [ ] Write fallback parser to handle edge cases in JSON responses.
- [ ] Implement manual tag editing IPC handlers (`saveCustomMetadata`, `addTag`, `removeTag`).
- [ ] Write unit tests with mocked Gemini responses in `tests/unit/gemini.test.ts`.

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M4 status).
3. Run tests: `npm run test`.
4. Commit: `git commit -m "feat(ai): integrate gemini vision tagging with rate-limited worker and schema parser"`.
