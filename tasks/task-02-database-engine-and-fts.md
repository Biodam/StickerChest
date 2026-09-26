# Task 02: Database Engine & FTS5

**Status**: ⚪ Not Started  
**Milestone**: M2  
**Estimated Complexity**: Medium

---

## Objectives
1. Implement the SQLite 3 connection and migration runner using `better-sqlite3`.
2. Apply schemas defined in `docs/standards/database-schema.md` (`items`, `variants`, `metadata`, `tags`, `item_tags`, `custom_attributes`, `usage_stats`).
3. Set up the `items_fts` FTS5 virtual table and triggers for automatic real-time indexing.
4. Implement a comprehensive Data Access Layer (DAL) for:
   - Item insertion and variant registration
   - Fast full-text search with token prefix matching and BM25 ranking
   - Usage frequency and favorites toggling
   - Custom metadata CRUD
5. Write unit tests validating schema creation, search queries, and triggers.

---

## Implementation Checklist
- [ ] Create `src/main/services/database/connection.ts` managing the SQLite instance in the app user data directory.
- [ ] Create migration system in `src/main/services/database/migrations/`.
- [ ] Implement `src/main/services/database/dal.ts` with typed methods:
  - `upsertItem(item: ItemInsert): Item`
  - `upsertVariants(variants: VariantInsert[]): void`
  - `saveMetadata(metadata: MetadataInsert): void`
  - `searchItems(query: string, options: SearchOptions): SearchResult`
  - `toggleFavorite(itemId: string): boolean`
  - `recordItemUsage(itemId: string): void`
- [ ] Create automated tests in `tests/unit/database.test.ts` verifying:
  - Table creation and foreign key constraints
  - FTS5 query matching characters, feelings, and tags
  - Trigger updates when metadata changes
  - Favorite and usage count increments

---

## Post-Completion Instructions
1. Check off completed items above.
2. Update `tasks/milestones.md` (M2 status).
3. Run tests: `npm run test`.
4. Commit: `git commit -m "feat(db): implement sqlite3 schema, migrations, and fts5 search dal"`.
